import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Avatar,
  Typography,
  Chip,
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Chat as ChatIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { fetchConversations } from "../../store/slices/chatSlice";
import { setActiveConversation } from "../../store/slices/chatSlice";

export default function ChatSidebar({ onConversationSelect }) {
  const dispatch = useDispatch();
  const { conversations, loading, unreadTotal } = useSelector((s) => s.chats);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const handleSelect = (conversation) => {
    dispatch(setActiveConversation(conversation));
    if (onConversationSelect) onConversationSelect(conversation);
  };

  const getOtherParty = (conv) => {
    if (!user) return null;
    if (user.role === "PATIENT") return conv.doctor_name;
    if (user.role === "DOCTOR") return conv.patient_name;
    return null;
  };

  const getAvatarColor = (name) => {
    if (!name) return "#175cdd";
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ["#175cdd", "#059669", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <ChatIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          No conversations yet
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Start a chat after booking an appointment
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ p: 0 }}>
      {conversations.map((conv, i) => {
        const otherName = getOtherParty(conv);
        const initials = (otherName || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
        const lastMsg = conv.last_message;
        const isUnread = (conv.unread_count || 0) > 0;

        return (
          <Box key={conv.id}>
            {i > 0 && <Divider />}
            <ListItemButton
              onClick={() => handleSelect(conv)}
              sx={{
                py: 1.5,
                px: 2,
                borderRadius: 1,
                mx: 1,
                "&:hover": { bgcolor: "action.hover" },
                ...(isUnread ? { bgcolor: "action.selected" } : {}),
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: getAvatarColor(otherName),
                    width: 44,
                    height: 44,
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {initials}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography component="div" noWrap sx={{ maxWidth: 160, display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" component="span" sx={{ fontWeight: 600, fontFamily: '"Montserrat", sans-serif' }}>
                      {otherName}
                    </Typography>
                    {conv.unread_count > 0 && (
                      <Chip
                        label={conv.unread_count}
                        size="small"
                        sx={{
                          bgcolor: "#175cdd",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 11,
                          minWidth: 20,
                          height: 20,
                        }}
                      />
                    )}
                  </Typography>
                }
                secondary={
                  <Typography component="div" variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {lastMsg?.sender_id === user?.id ? (
                      <Typography variant="caption" component="span" color="text.disabled" sx={{ fontStyle: "italic" }}>
                        You:
                      </Typography>
                    ) : (
                      <Typography variant="caption" component="span" color="text.secondary">
                        {lastMsg?.sender_name}:
                      </Typography>
                    )}
                    <Typography
                      variant="caption"
                      component="span"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 140,
                      }}
                    >
                      {lastMsg?.body || "No messages yet"}
                    </Typography>
                  </Typography>
                }
              />
              {lastMsg && (
                <Typography variant="caption" color="text.disabled" sx={{ ml: 1, flexShrink: 0 }}>
                  {dayjs(lastMsg.created_at).format("HH:mm")}
                </Typography>
              )}
            </ListItemButton>
          </Box>
        );
      })}
    </List>
  );
}
