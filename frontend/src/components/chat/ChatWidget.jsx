import { useState } from "react";
import { Box, Paper, IconButton, Collapse, Badge, Typography } from "@mui/material";
import { Chat as ChatIcon } from "@mui/icons-material";
import { useSelector } from "react-redux";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const { user } = useSelector((s) => s.auth);
  const { conversations, activeConversation } = useSelector((s) => s.chats);

  const unreadTotal = conversations?.reduce((sum, c) => sum + (c.unread_count || 0), 0) || 0;

  const getOtherParty = (conv) => {
    if (!user || !conv) return { name: "", role: "", id: null };
    if (user.role === "PATIENT") return { name: conv.doctor_name, role: "DOCTOR", id: conv.doctor };
    if (user.role === "DOCTOR") return { name: conv.patient_name, role: "PATIENT", id: conv.patient };
    return { name: "", role: "", id: null };
  };

  return (
    <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1300, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
      <Collapse in={open} orientation="vertical" timeout={300}>
        <Paper
          sx={{
            width: 380,
            maxHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            border: "1px solid #e2e8f0",
          }}
        >
          {activeConversation ? (
            <ChatWindow
              conversationId={activeConversation.id}
              otherName={getOtherParty(activeConversation).name}
              otherRole={getOtherParty(activeConversation).role}
              otherUserId={getOtherParty(activeConversation).id}
            />
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <Box sx={{ p: 2, bgcolor: "#175cdd", color: "#fff", display: "flex", alignItems: "center", gap: 1 }}>
                <ChatIcon />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: '"Montserrat", sans-serif' }}>Chats</Typography>
              </Box>
              <Box sx={{ flex: 1, overflow: "auto" }}>
                <ChatSidebar />
              </Box>
            </Box>
          )}
        </Paper>
      </Collapse>

      <Badge badgeContent={unreadTotal > 0 ? unreadTotal : null} color="error" max={99}>
        <IconButton
          onClick={() => setOpen((v) => !v)}
          sx={{
            bgcolor: "#175cdd",
            color: "#fff",
            width: 56,
            height: 56,
            boxShadow: "0 4px 16px rgba(23,92,221,0.4)",
            "&:hover": { bgcolor: "#0f4ba0" },
          }}
        >
          <ChatIcon sx={{ fontSize: 28 }} />
        </IconButton>
      </Badge>
    </Box>
  );
}
