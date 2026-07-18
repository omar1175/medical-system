import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addMessage,
  addMessages,
  setTypingUsers,
  setOnlineUsers,
  updateUnreadTotal,
  updateConversationLastMessage,
  markMessageEdited,
  markMessageDeleted,
} from "../store/slices/chatSlice";
import { chatService } from "../services/chatService";

const WS_BASE = import.meta.env.VITE_WS_URL ||
  (window.location.protocol === "https:" ? "wss://" : "ws://") + window.location.host;

export function useChatWebSocket(conversationId) {
  const dispatch = useDispatch();
  const wsRef = useRef(null);
  const typingTimeout = useRef(null);
  const isTyping = useRef(false);
  const reconnectTimer = useRef(null);
  const { user } = useSelector((s) => s.auth);

  const connect = useCallback(() => {
    if (!conversationId || !user?.id) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    const ws = new WebSocket(`${WS_BASE}/api/v1/ws/chat/${conversationId}/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[ChatWS] Connected to conversation", conversationId);
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleIncoming(data);
      } catch (e) {
        console.error("[ChatWS] Failed to parse message:", e);
      }
    };

    ws.onclose = () => {
      console.log("[ChatWS] Disconnected");
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      console.error("[ChatWS] Error");
    };
  }, [conversationId, user]);

  const handleIncoming = (data) => {
    switch (data.type) {
      case "chat.reconnect":
        dispatch(addMessages(data.messages));
        break;
      case "chat.message_event":
        dispatch(addMessage(data));
        dispatch(updateConversationLastMessage({
          conversationId: Number(conversationId),
          message: data,
        }));
        break;
      case "chat.typing_event":
        if (data.sender_id !== user?.id) {
          dispatch(setTypingUsers({ senderId: data.sender_id, isTyping: data.is_typing }));
        }
        break;
      case "chat.read_event":
        if (data.marked_by !== user?.id) {
          dispatch(updateUnreadTotal(-(data.marked_read || 0)));
        }
        break;
      case "chat.presence":
        dispatch(setOnlineUsers(data.online_users || []));
        break;
      case "chat.message_edited_event":
        dispatch(markMessageEdited({ messageId: data.message_id, body: data.body }));
        break;
      case "chat.message_deleted_event":
        dispatch(markMessageDeleted({ messageId: data.message_id }));
        break;
      default:
        break;
    }
  };

  const sendMessage = useCallback(
    (body) => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "chat.message", body }));
      } else {
        chatService.sendMessage(conversationId, body).then((res) => {
          dispatch(addMessage(res.data));
          dispatch(updateConversationLastMessage({
            conversationId: Number(conversationId),
            message: res.data,
          }));
        });
      }
    },
    [conversationId, dispatch],
  );

  const sendFileMessage = useCallback(
    (file, body = "") => {
      const formData = new FormData();
      formData.append("attachment", file);
      if (body) formData.append("body", body);
      chatService.sendFile(conversationId, formData).then((res) => {
        dispatch(addMessage(res.data));
        dispatch(updateConversationLastMessage({
          conversationId: Number(conversationId),
          message: res.data,
        }));
      });
    },
    [conversationId, dispatch],
  );

  const editMessage = useCallback(
    (messageId, newBody) => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "chat.edit_message", message_id: messageId, body: newBody }));
      } else {
        chatService.editMessage(conversationId, messageId, newBody).then((res) => {
          dispatch(markMessageEdited({ messageId, body: newBody }));
        });
      }
    },
    [conversationId, dispatch],
  );

  const deleteMessage = useCallback(
    (messageId) => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "chat.delete_message", message_id: messageId }));
      } else {
        chatService.deleteMessage(conversationId, messageId).then(() => {
          dispatch(markMessageDeleted({ messageId }));
        });
      }
    },
    [conversationId, dispatch],
  );

  const sendTyping = useCallback(
    (isTypingFlag) => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "chat.typing", is_typing: isTypingFlag }));
      }
    },
    [],
  );

  const markAllRead = useCallback(() => {
    chatService.markRead(conversationId);
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, [conversationId, connect]);

  const handleTyping = useCallback(
    (text) => {
      if (!text.trim()) {
        sendTyping(false);
        return;
      }

      if (!isTyping.current) {
        isTyping.current = true;
        sendTyping(true);
      }

      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
      typingTimeout.current = setTimeout(() => {
        sendTyping(false);
        isTyping.current = false;
      }, 2000);
    },
    [sendTyping],
  );

  return {
    sendMessage,
    sendFileMessage,
    editMessage,
    deleteMessage,
    handleTyping,
    markAllRead,
  };
}
