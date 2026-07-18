import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Container, Paper } from "@mui/material";
import { fetchConversations } from "../../store/slices/chatSlice";
import { setActiveConversation } from "../../store/slices/chatSlice";
import ChatSidebar from "../../components/chat/ChatSidebar";
import ChatWindow from "../../components/chat/ChatWindow";

export default function ChatPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { activeConversation } = useSelector((s) => s.chats);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const getOtherParty = (conv) => {
    if (!conv) return { name: "", role: "", id: null };
    if (user?.role === "PATIENT") return { name: conv.doctor_name, role: "DOCTOR", id: conv.doctor };
    if (user?.role === "DOCTOR") return { name: conv.patient_name, role: "PATIENT", id: conv.patient };
    return { name: "", role: "", id: null };
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
      <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: '"Montserrat", sans-serif', mb: 2, color: "#112344" }}>
        Messages
      </Typography>
      <Paper sx={{ flex: 1, display: "flex", overflow: "hidden", borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <Box sx={{ width: 320, borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
          <Box sx={{ p: 2, bgcolor: "#175cdd", color: "#fff" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: '"Montserrat", sans-serif' }}>Conversations</Typography>
          </Box>
          <Box sx={{ flex: 1, overflow: "auto" }}>
            <ChatSidebar />
          </Box>
        </Box>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {activeConversation ? (
            <ChatWindow
              conversationId={activeConversation.id}
              otherName={getOtherParty(activeConversation).name}
              otherRole={getOtherParty(activeConversation).role}
              otherUserId={getOtherParty(activeConversation).id}
            />
          ) : (
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0.5 }}>
              <Typography variant="h6" color="text.secondary">Select a conversation to start chatting</Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
