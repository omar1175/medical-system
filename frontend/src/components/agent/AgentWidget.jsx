import { useState, useRef, useEffect } from "react";
import {
  Box,
  Fab,
  Drawer,
  Typography,
  TextField,
  IconButton,
  Paper,
  CircularProgress,
  Button,
  Tooltip,
} from "@mui/material";
import {
  SmartToy,
  Close,
  Send,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import agentService from "../../services/agent";

const DRAWER_WIDTH = 380;

export default function AgentWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      loadHistory();
    }
  }, [open]);

  const loadHistory = async () => {
    try {
      const res = await agentService.history();
      const history = res.data.messages || [];
      const formatted = history.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      setMessages(formatted);
      const lastAssistant = [...history].reverse().find((m) => m.role === "assistant");
      if (lastAssistant && lastAssistant.tool_name) {
        try {
          const toolResult = JSON.parse(lastAssistant.content);
          if (toolResult && toolResult.proposal_id && !toolResult.success) {
            setPendingConfirmation(toolResult);
          }
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || pendingConfirmation) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const payload = { message: userMsg };
      const res = await agentService.chat(payload);
      const reply = res.data.reply || "No response.";
      const pc = res.data.pending_confirmation || null;
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setPendingConfirmation(pc);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (proposalId) => {
    if (!proposalId || confirmLoading) return;
    setConfirmLoading(true);
    try {
      const payload = { confirm_proposal_id: proposalId };
      const res = await agentService.chat(payload);
      const reply = res.data.reply || "Action completed.";
      const pc = res.data.pending_confirmation || null;
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setPendingConfirmation(pc);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Failed to confirm. Please try again." }]);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleReject = () => {
    setPendingConfirmation(null);
    setMessages((prev) => [...prev, { role: "assistant", content: "Action cancelled." }]);
  };

  return (
    <Box>
      <Tooltip title="AI Assistant" arrow>
        <Fab
          color="primary"
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1300,
            background: "linear-gradient(135deg, #175cdd 0%, #4a90e2 100%)",
            width: 56,
            height: 56,
            "&:hover": {
              background: "linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)",
            },
          }}
        >
          <SmartToy />
        </Fab>
      </Tooltip>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100vw", sm: DRAWER_WIDTH },
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Box
          sx={{
            background: "linear-gradient(135deg, #175cdd 0%, #4a90e2 100%)",
            color: "#fff",
            px: 2.5,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SmartToy sx={{ fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700 }}>
              AI Assistant
            </Typography>
          </Box>
          <IconButton onClick={() => setOpen(false)} sx={{ color: "#fff" }}>
            <Close />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", p: 2, bgcolor: "#f8fafc" }}>
          {messages.length === 0 && (
            <Box sx={{ textAlign: "center", mt: 6, color: "text.secondary" }}>
              <SmartToy sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
              <Typography variant="body2">
                Hello! I can help you book, reschedule, or cancel appointments. How can I assist you today?
              </Typography>
            </Box>
          )}
          {messages.map((m, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                mb: 1.5,
              }}
            >
              <Paper
                sx={{
                  px: 2,
                  py: 1.2,
                  borderRadius: 2,
                  maxWidth: "85%",
                  whiteSpace: "pre-wrap",
                  ...(m.role === "user"
                    ? {
                        bgcolor: "#175cdd",
                        color: "#fff",
                        borderBottomRightRadius: 4,
                      }
                    : {
                        bgcolor: "#fff",
                        color: "#112344",
                        borderBottomLeftRadius: 4,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      }),
                }}
              >
                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                  {m.content}
                </Typography>
              </Paper>
            </Box>
          ))}
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 1.5 }}>
              <Paper sx={{ px: 2, py: 1.2, borderRadius: 2, bgcolor: "#fff" }}>
                <CircularProgress size={16} />
              </Paper>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {pendingConfirmation && (
          <Box sx={{ px: 2, py: 1.5, bgcolor: "#fff7ed", borderTop: "1px solid #fed7aa" }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "#9a3412" }}>
              Please confirm:
            </Typography>
            <Typography variant="body2" sx={{ color: "#7c2d12", mb: 1 }}>
              {pendingConfirmation.summary}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<CheckCircle />}
                onClick={() => handleConfirm(pendingConfirmation.proposal_id)}
                disabled={confirmLoading}
                sx={{
                  background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "0.75rem",
                }}
              >
                {confirmLoading ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : "Confirm"}
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Cancel />}
                onClick={handleReject}
                disabled={confirmLoading}
                sx={{
                  borderColor: "#fca5a5",
                  color: "#dc2626",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "0.75rem",
                  "&:hover": { borderColor: "#f87171", bgcolor: "#fef2f2" },
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}

        <Box
          component="form"
          onSubmit={handleSend}
          sx={{
            p: 2,
            bgcolor: "#fff",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            gap: 1,
            alignItems: "center",
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder={pendingConfirmation ? "Please confirm or cancel the action above." : "Type a message..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!!pendingConfirmation || confirmLoading}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "#f8fafc",
              },
            }}
          />
          <IconButton
            type="submit"
            color="primary"
            disabled={!input.trim() || loading || !!pendingConfirmation || confirmLoading}
            sx={{
              bgcolor: "#175cdd",
              color: "#fff",
              "&:hover": { bgcolor: "#0d47a1" },
              "&.Mui-disabled": { bgcolor: "#e5e7eb", color: "#9ca3af" },
            }}
          >
            <Send fontSize="small" />
          </IconButton>
        </Box>
      </Drawer>
    </Box>
  );
}
