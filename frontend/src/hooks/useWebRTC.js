import { useEffect, useRef, useCallback, useState } from "react";

const WS_BASE = import.meta.env.VITE_WS_URL ||
  (window.location.protocol === "https:" ? "wss://" : "ws://") + window.location.host;

const CONNECTION_STATES = {
  IDLE: "idle",
  CONNECTING: "connecting",
  WAITING: "waiting",
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
  FAILED: "failed",
  ENDED: "ended",
};

export { CONNECTION_STATES };

export function useWebRTC(appointmentId) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionState, setConnectionState] = useState(CONNECTION_STATES.IDLE);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [error, setError] = useState(null);
  const [peerName, setPeerName] = useState("");
  const [participantCount, setParticipantCount] = useState(0);

  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const iceServersRef = useRef(null);
  const reconnectTimer = useRef(null);
  const isInitiator = useRef(false);
  const hasCreatedOffer = useRef(false);
  const creatingOffer = useRef(false);
  const mountedRef = useRef(true);
  const connectingRef = useRef(false);
  const iceCandidatesBuffer = useRef([]);

  // ---- PeerConnection creation ----
  const createPeerConnection = useCallback((iceServers) => {
    if (pcRef.current) {
      try { pcRef.current.close(); } catch {}
    }

    const config = {
      iceServers: iceServers || [{ urls: "stun:stun.l.google.com:19302" }],
    };

    const pc = new RTCPeerConnection(config);
    pcRef.current = pc;
    iceCandidatesBuffer.current = [];
    hasCreatedOffer.current = false;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pc.ontrack = (event) => {
      console.log("[WebRTC] ontrack, streams:", event.streams?.length);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "call.ice-candidate",
            candidate: event.candidate.toJSON(),
          })
        );
      }
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      console.log("[WebRTC] ICE state:", state);
      if (state === "connected" || state === "completed") {
        setConnectionState(CONNECTION_STATES.CONNECTED);
      } else if (state === "disconnected") {
        setConnectionState(CONNECTION_STATES.DISCONNECTED);
      } else if (state === "failed") {
        setConnectionState(CONNECTION_STATES.FAILED);
        setError("Connection lost. The peer may have disconnected.");
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === "failed") {
        setConnectionState(CONNECTION_STATES.FAILED);
        setError("Peer connection failed.");
      }
    };

    return pc;
  }, []);

  // ---- Create offer ----
  const createOffer = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc || hasCreatedOffer.current || creatingOffer.current) return;

    creatingOffer.current = true;
    try {
      hasCreatedOffer.current = true;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "call.offer",
            sdp: pc.localDescription.toJSON(),
          })
        );
      }
    } catch (err) {
      console.warn("[WebRTC] Failed to create offer:", err);
      hasCreatedOffer.current = false;
    } finally {
      creatingOffer.current = false;
    }
  }, []);

  // ---- Handle incoming offer ----
  const handleOffer = useCallback(async (sdp) => {
    let pc = pcRef.current;
    if (!pc) return;

    if (pc.signalingState === "have-local-offer") {
      console.warn("[WebRTC] Received offer while we have a local offer — discarding ours, accepting theirs");
      try { pc.close(); } catch {}
      pc = createPeerConnection(iceServersRef.current);
      isInitiator.current = false;
      hasCreatedOffer.current = false;
    } else if (pc.signalingState === "stable") {
      console.log("[WebRTC] Received offer in stable state — proceeding as answerer");
    } else {
      console.warn("[WebRTC] Received offer in unexpected state:", pc.signalingState, "- recreating PC");
      try { pc.close(); } catch {}
      pc = createPeerConnection(iceServersRef.current);
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "call.answer",
            sdp: pc.localDescription.toJSON(),
          })
        );
      }

      flushIceCandidates();
    } catch (err) {
      console.error("[WebRTC] Failed to handle offer:", err);
      setError("Failed to establish connection.");
    }
  }, []);

  // ---- Handle incoming answer ----
  const handleAnswer = useCallback(async (sdp) => {
    const pc = pcRef.current;
    if (!pc) return;
    if (pc.signalingState !== "have-local-offer") {
      console.warn("[WebRTC] Ignoring answer in state:", pc.signalingState);
      return;
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      flushIceCandidates();
    } catch (err) {
      console.error("[WebRTC] Failed to handle answer:", err);
    }
  }, []);

  // ---- Handle incoming ICE candidate ----
  const handleIceCandidate = useCallback(async (candidate) => {
    const pc = pcRef.current;
    if (!pc) return;

    try {
      if (pc.remoteDescription) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        iceCandidatesBuffer.current.push(candidate);
      }
    } catch (err) {
      console.warn("[WebRTC] Failed to add ICE candidate:", err);
    }
  }, []);

  // ---- Flush buffered ICE candidates ----
  const flushIceCandidates = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;

    for (const candidate of iceCandidatesBuffer.current) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn("[WebRTC] Failed to add buffered ICE candidate:", err);
      }
    }
    iceCandidatesBuffer.current = [];
  }, []);

  // ---- Cleanup ----
  const cleanup = useCallback(() => {
    if (pcRef.current) {
      try { pcRef.current.close(); } catch {}
      pcRef.current = null;
    }
    if (wsRef.current) {
      try { wsRef.current.close(1000); } catch {}
      wsRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    hasCreatedOffer.current = false;
    isInitiator.current = false;
    iceCandidatesBuffer.current = [];
  }, []);

  // =====================================================
  // KEY FIX: Use a ref for the signaling message handler
  // so ws.onmessage always calls the latest version,
  // eliminating stale closure bugs.
  // =====================================================
  const handleSignalingRef = useRef(null);

  // Keep the ref pointing to the latest handler
  handleSignalingRef.current = (data) => {
    console.log("[WebRTC] Received signal:", data.type, data);

    switch (data.type) {
      case "room.joined": {
        iceServersRef.current = data.ice_servers;
        createPeerConnection(data.ice_servers);
        setParticipantCount(data.participant_count);

        if (data.is_initiator) {
          isInitiator.current = true;
          setConnectionState(CONNECTION_STATES.CONNECTING);
          console.log("[WebRTC] Server designated as initiator, creating offer...");
          createOffer();
        } else {
          setConnectionState(CONNECTION_STATES.WAITING);
        }
        break;
      }
      case "call.user_joined": {
        setParticipantCount(data.participant_count);
        if (isInitiator.current && pcRef.current) {
          console.log("[WebRTC] Peer joined, initiator creating offer...");
          hasCreatedOffer.current = false;
          createOffer();
        }
        break;
      }
      case "call.user_left": {
        setParticipantCount(data.participant_count);
        setRemoteStream(null);
        if (data.participant_count === 0) {
          setConnectionState(CONNECTION_STATES.ENDED);
        } else {
          setConnectionState(CONNECTION_STATES.WAITING);
          hasCreatedOffer.current = false;
          if (pcRef.current) {
            try { pcRef.current.close(); } catch {}
            pcRef.current = null;
          }
          if (iceServersRef.current) {
            createPeerConnection(iceServersRef.current);
          }
        }
        break;
      }
      case "call.both_connected": {
        setConnectionState(CONNECTION_STATES.CONNECTING);
        console.log("[WebRTC] Both participants connected");
        break;
      }
      case "call.offer": {
        setConnectionState(CONNECTION_STATES.CONNECTING);
        handleOffer(data.sdp);
        break;
      }
      case "call.answer": {
        handleAnswer(data.sdp);
        break;
      }
      case "call.ice-candidate": {
        handleIceCandidate(data.candidate);
        break;
      }
      case "call.end": {
        cleanup();
        setConnectionState(CONNECTION_STATES.ENDED);
        break;
      }
      default:
        break;
    }
  };

  // ---- Get local media ----
  const initLocalMedia = useCallback(async () => {
    try {
      let stream;
      try {
        // Try video + audio first
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (e) {
        console.warn("[WebRTC] video+audio failed, trying audio only:", e.message);
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
        } catch (e2) {
          console.warn("[WebRTC] audio only also failed, trying video only:", e2.message);
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
          } catch (e3) {
            console.warn("[WebRTC] All media failed, proceeding without media:", e3.message);
            // Create a silent stream so WebRTC still works for signaling
            const ctx = new AudioContext();
            const dest = ctx.createMediaStreamDestination();
            stream = new MediaStream(dest.stream.getTracks());
          }
        }
      }
      localStreamRef.current = stream;
      setLocalStream(stream);
      setConnectionState(CONNECTION_STATES.WAITING);
      return stream;
    } catch (err) {
      console.error("[WebRTC] getUserMedia error:", err);
      if (err.name === "NotAllowedError") {
        setError("Camera/microphone permission denied. Please allow access and refresh.");
      } else if (err.name === "NotFoundError") {
        setError("No camera or microphone found on this device.");
      } else {
        setError("Failed to access camera/microphone: " + err.message);
      }
      setConnectionState(CONNECTION_STATES.FAILED);
      return null;
    }
  }, []);

  // ---- Connect WebSocket (uses ref for handler - no stale closure) ----
  const connectWebSocket = useCallback(
    (token) => {
      if (!appointmentId || !token) return;

      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        console.log("[CallWS] Already connected/connecting, skipping duplicate");
        return;
      }

      const wsUrl = `${WS_BASE}/api/v1/ws/calls/${appointmentId}/?token=${token}`;
      console.log("[CallWS] Connecting to", wsUrl);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[CallWS] Connected to call room", appointmentId);
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
          reconnectTimer.current = null;
        }
      };

      // KEY: Read from ref so we always call the latest handler
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleSignalingRef.current?.(data);
        } catch (e) {
          console.error("[CallWS] Failed to parse message:", e);
        }
      };

      ws.onclose = (event) => {
        console.log("[CallWS] Disconnected, code:", event.code);
        if (event.code !== 1000 && event.code !== 4000) {
          reconnectTimer.current = setTimeout(() => {
            const t = localStorage.getItem("access_token");
            if (t) connectWebSocket(t);
          }, 3000);
        }
      };

      ws.onerror = (err) => {
        console.error("[CallWS] Error", err);
      };
    },
    [appointmentId],
  );

  // ---- Toggle mute/camera ----
  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const audioTracks = stream.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsMuted((prev) => {
      const newState = !prev;
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "call.mute", muted: newState })
        );
      }
      return newState;
    });
  }, []);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const videoTracks = stream.getVideoTracks();
    videoTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsCameraOff((prev) => {
      const newState = !prev;
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "call.video-off", camera_off: newState })
        );
      }
      return newState;
    });
  }, []);

  const endCall = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "call.end" }));
    }
    cleanup();
    setConnectionState(CONNECTION_STATES.ENDED);
  }, [cleanup]);

  // ---- Main connect ----
  const connect = useCallback(async () => {
    if (connectingRef.current) {
      console.log("[WebRTC] Already connecting, skipping duplicate");
      return;
    }
    connectingRef.current = true;
    try {
      setConnectionState(CONNECTION_STATES.CONNECTING);
      const stream = await initLocalMedia();
      if (!stream || !mountedRef.current) return;

      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Not authenticated. Please log in again.");
        setConnectionState(CONNECTION_STATES.FAILED);
        return;
      }
      if (!mountedRef.current) return;
      connectWebSocket(token);
    } finally {
      connectingRef.current = false;
    }
  }, [initLocalMedia, connectWebSocket]);

  useEffect(() => {
    mountedRef.current = true;
    if (appointmentId) {
      connect();
    }

    return () => {
      mountedRef.current = false;
      cleanup();
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, [appointmentId]);

  return {
    localStream,
    remoteStream,
    connectionState,
    isMuted,
    isCameraOff,
    toggleMute,
    toggleCamera,
    endCall,
    error,
    peerName,
    participantCount,
    connect,
  };
}
