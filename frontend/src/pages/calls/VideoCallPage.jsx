import { useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import { VideocamOff, ArrowBack } from "@mui/icons-material";
import { useWebRTC, CONNECTION_STATES } from "../../hooks/useWebRTC";
import CallControls from "../../components/call/CallControls";
import ConnectionStatus from "../../components/call/ConnectionStatus";

function VideoStream({ stream, muted, label, isLocal, isOff, sx }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "#0a0a0a",
        ...sx,
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: isLocal ? "scaleX(-1)" : "none",
          display: isOff ? "none" : "block",
        }}
      />
      {isOff && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#1a1a2e",
          }}
        >
          <VideocamOff sx={{ fontSize: 48, color: "#6b7280" }} />
        </Box>
      )}
      {label && (
        <Box
          sx={{
            position: "absolute",
            bottom: 12,
            left: 12,
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "rgba(0,0,0,0.6)",
            borderRadius: 2,
            px: 1.5,
            py: 0.5,
          }}
        >
          <Typography sx={{ color: "#fff", fontSize: "0.8rem", fontWeight: 600 }}>
            {label}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function WaitingOverlay({ connectionState, participantCount }) {
  const getMessage = () => {
    switch (connectionState) {
      case "idle":
        return "Initializing...";
      case "connecting":
        return "Establishing connection...";
      case "waiting":
        if (participantCount < 2) {
          return "Waiting for the other participant to join...";
        }
        return "Connecting to peer...";
      default:
        return "Connecting...";
    }
  };

  const getSubMessage = () => {
    if (participantCount < 2) {
      return "You will be connected automatically when they join";
    }
    return "Setting up video call...";
  };

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        zIndex: 10,
      }}
    >
      <CircularProgress size={48} sx={{ color: "#175cdd" }} />
      <Typography
        sx={{
          color: "#ffffff",
          fontSize: "1.1rem",
          fontWeight: 600,
          fontFamily: '"Montserrat", sans-serif',
          textAlign: "center",
        }}
      >
        {getMessage()}
      </Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>
        {getSubMessage()}
      </Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", mt: 1 }}>
        Participants: {participantCount}/2
      </Typography>
    </Box>
  );
}

function EndedOverlay({ onGoBack }) {
  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        zIndex: 10,
      }}
    >
      <Avatar
        sx={{
          width: 80,
          height: 80,
          bgcolor: "#dc2626",
          boxShadow: "0 4px 20px rgba(220,38,38,0.3)",
        }}
      >
        <VideocamOff sx={{ fontSize: 40 }} />
      </Avatar>
      <Typography
        sx={{
          color: "#ffffff",
          fontSize: "1.2rem",
          fontWeight: 700,
          fontFamily: '"Montserrat", sans-serif',
        }}
      >
        Call Ended
      </Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>
        The consultation has ended
      </Typography>
      <Box
        onClick={onGoBack}
        sx={{
          mt: 2,
          px: 4,
          py: 1.5,
          borderRadius: 2,
          bgcolor: "#175cdd",
          color: "#fff",
          cursor: "pointer",
          fontWeight: 600,
          fontFamily: '"Montserrat", sans-serif',
          "&:hover": { bgcolor: "#0f4ba0" },
        }}
      >
        Back to Appointments
      </Box>
    </Box>
  );
}

function ErrorOverlay({ message, onGoBack }) {
  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        zIndex: 10,
      }}
    >
      <Avatar
        sx={{
          width: 80,
          height: 80,
          bgcolor: "#dc2626",
          boxShadow: "0 4px 20px rgba(220,38,38,0.3)",
        }}
      >
        <VideocamOff sx={{ fontSize: 40 }} />
      </Avatar>
      <Typography
        sx={{
          color: "#ffffff",
          fontSize: "1.1rem",
          fontWeight: 700,
          fontFamily: '"Montserrat", sans-serif',
          textAlign: "center",
          maxWidth: 400,
        }}
      >
        {message}
      </Typography>
      <Box
        onClick={onGoBack}
        sx={{
          mt: 2,
          px: 4,
          py: 1.5,
          borderRadius: 2,
          bgcolor: "#175cdd",
          color: "#fff",
          cursor: "pointer",
          fontWeight: 600,
          fontFamily: '"Montserrat", sans-serif',
          "&:hover": { bgcolor: "#0f4ba0" },
        }}
      >
        Back to Appointments
      </Box>
    </Box>
  );
}

export default function VideoCallPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const {
    localStream,
    remoteStream,
    connectionState,
    isMuted,
    isCameraOff,
    toggleMute,
    toggleCamera,
    endCall,
    error,
    participantCount,
  } = useWebRTC(appointmentId);

  const goBack = () => {
    const basePath = user?.role === "DOCTOR" ? "/doctor" : "/patient";
    navigate(`${basePath}/appointments`);
  };

  const showWaiting =
    connectionState === CONNECTION_STATES.WAITING ||
    connectionState === CONNECTION_STATES.CONNECTING ||
    connectionState === CONNECTION_STATES.IDLE;

  const showEnded = connectionState === CONNECTION_STATES.ENDED;
  const showError = connectionState === CONNECTION_STATES.FAILED || error;

  const localLabel = useMemo(
    () => (user?.first_name ? `${user.first_name} (You)` : "You"),
    [user],
  );

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        zIndex: 1300,
      }}
    >
      {/* Top Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 1.5,
          bgcolor: "rgba(0,0,0,0.8)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Tooltip title="Back to appointments">
            <IconButton onClick={goBack} sx={{ color: "#fff" }}>
              <ArrowBack />
            </IconButton>
          </Tooltip>
          <Typography
            sx={{
              color: "#fff",
              fontWeight: 700,
              fontFamily: '"Montserrat", sans-serif',
              fontSize: "0.95rem",
            }}
          >
            Video Consultation
          </Typography>
        </Box>
        <ConnectionStatus connectionState={connectionState} />
      </Box>

      {/* Video Area */}
      <Box
        sx={{
          flex: 1,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Remote Video (full screen) */}
        {remoteStream && connectionState === CONNECTION_STATES.CONNECTED ? (
          <VideoStream
            stream={remoteStream}
            muted={false}
            label=""
            isLocal={false}
            isOff={false}
            sx={{ position: "absolute", inset: 0, borderRadius: 0 }}
          />
        ) : (
          !showEnded &&
          !showError && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
              }}
            />
          )
        )}

        {/* Local Video (PIP) */}
        {localStream && !showEnded && !showError && (
          <VideoStream
            stream={localStream}
            muted={true}
            label={localLabel}
            isLocal={true}
            isOff={isCameraOff}
            sx={{
              position: "absolute",
              bottom: 20,
              right: 20,
              width: 200,
              height: 150,
              zIndex: 20,
              border: "2px solid rgba(255,255,255,0.2)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          />
        )}

        {/* Overlays */}
        {showWaiting && !showEnded && !showError && (
          <WaitingOverlay connectionState={connectionState} participantCount={participantCount} />
        )}
        {showEnded && <EndedOverlay onGoBack={goBack} />}
        {showError && <ErrorOverlay message={error} onGoBack={goBack} />}
      </Box>

      {/* Bottom Controls */}
      {!showEnded && !showError && (
        <Box sx={{ bgcolor: "rgba(0,0,0,0.8)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <CallControls
            isMuted={isMuted}
            isCameraOff={isCameraOff}
            onToggleMute={toggleMute}
            onToggleCamera={toggleCamera}
            onEndCall={endCall}
          />
        </Box>
      )}
    </Box>
  );
}
