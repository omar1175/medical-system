import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Typography, TextField, IconButton, InputAdornment, Avatar, Paper,
  CircularProgress, Menu, MenuItem, ListItemIcon, ListItemText, Dialog,
  DialogTitle, DialogContent, DialogActions, Button, Chip,
} from "@mui/material";
import {
  Send as SendIcon,
  EmojiEmotions as EmojiIcon,
  AttachFile as AttachFileIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  ArrowUpward as ArrowUpwardIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { useChatWebSocket } from "../../hooks/useWebSocket";
import { fetchConversationDetail, loadMoreMessages } from "../../store/slices/chatSlice";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export default function ChatWindow({ conversationId, otherName, otherRole, otherUserId }) {
  const dispatch = useDispatch();
  const { messages, typingUsers, onlineUsers, loadingMore, hasMore, activeConversation } = useSelector((s) => s.chats);
  const { user } = useSelector((s) => s.auth);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState({ open: false, messageId: null, body: "" });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, messageId: null });
  const [previewFile, setPreviewFile] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const { sendMessage, sendFileMessage, editMessage, deleteMessage, handleTyping, markAllRead } = useChatWebSocket(conversationId);

  useEffect(() => {
    setLoading(true);
    dispatch(fetchConversationDetail(conversationId)).unwrap().finally(() => setLoading(false));
    markAllRead();
  }, [conversationId, dispatch, markAllRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text && !previewFile) return;

    if (previewFile) {
      sendFileMessage(previewFile, text);
      setPreviewFile(null);
    } else {
      sendMessage(text);
    }
    setInput("");
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInputChange = (e) => { setInput(e.target.value); handleTyping(e.target.value); };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }
    setPreviewFile(file);
    e.target.value = "";
  };

  const handleLoadMore = () => {
    if (messages.length > 0) {
      dispatch(loadMoreMessages({ conversationId, before: messages[0].id }));
    }
  };

  const handleEditSubmit = () => {
    if (editDialog.body.trim() && editDialog.messageId) {
      editMessage(editDialog.messageId, editDialog.body.trim());
      setEditDialog({ open: false, messageId: null, body: "" });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.messageId) {
      deleteMessage(deleteDialog.messageId);
      setDeleteDialog({ open: false, messageId: null });
    }
  };

  const isOnline = otherUserId && onlineUsers.includes(otherUserId);
  const isTyping = otherUserId && typingUsers[otherUserId];

  if (loading) {
    return <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}><CircularProgress size={32} /></Box>;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "#f8fafc" }}>
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ bgcolor: "#175cdd", width: 40, height: 40, fontSize: 14, fontWeight: 700 }}>
          {(otherName || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
        </Avatar>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: '"Montserrat", sans-serif' }}>{otherName}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: isOnline ? "#059669" : "#9ca3af" }} />
            <Typography variant="caption" color="text.secondary">
              {isOnline ? "Online" : "Offline"}
              {isTyping && <span style={{ color: "#059669", marginLeft: 4 }}> · Typing...</span>}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Messages */}
      <Box ref={messagesContainerRef} sx={{ flex: 1, overflow: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
        {hasMore && messages.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
            <Button
              size="small"
              startIcon={loadingMore ? <CircularProgress size={14} /> : <ArrowUpwardIcon />}
              onClick={handleLoadMore}
              disabled={loadingMore}
              sx={{ textTransform: "none", fontSize: 12 }}
            >
              {loadingMore ? "Loading..." : "Load older messages"}
            </Button>
          </Box>
        )}

        {messages.length === 0 ? (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0.5 }}>
            <EmojiIcon sx={{ fontSize: 64, mb: 1 }} />
            <Typography variant="body2" color="text.secondary">No messages yet. Start the conversation!</Typography>
          </Box>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              user={user}
              otherName={otherName}
              prevMsg={messages[i - 1]}
              onEdit={() => setEditDialog({ open: true, messageId: msg.id, body: msg.body })}
              onDelete={() => setDeleteDialog({ open: true, messageId: msg.id })}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Preview file */}
      {previewFile && (
        <Box sx={{ px: 1.5, pt: 1, bgcolor: "#fff", borderTop: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 1 }}>
          {IMAGE_TYPES.includes(previewFile.type) ? (
            <Box sx={{ position: "relative" }}>
              <Box component="img" src={URL.createObjectURL(previewFile)} sx={{ height: 60, borderRadius: 1, objectFit: "cover" }} />
              <IconButton size="small" onClick={() => setPreviewFile(null)} sx={{ position: "absolute", top: -8, right: -8, bgcolor: "#fff", boxShadow: 1 }}>
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ) : (
            <Chip
              icon={<FileIcon />}
              label={previewFile.name}
              onDelete={() => setPreviewFile(null)}
              size="small"
            />
          )}
        </Box>
      )}

      {/* Input */}
      <ChatInput
        input={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onSend={handleSend}
        inputRef={inputRef}
        onFileClick={() => fileInputRef.current?.click()}
      />
      <input ref={fileInputRef} type="file" hidden accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFileSelect} />

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, messageId: null, body: "" })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Message</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            maxRows={4}
            value={editDialog.body}
            onChange={(e) => setEditDialog((prev) => ({ ...prev, body: e.target.value }))}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEditSubmit(); } }}
            variant="outlined"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, messageId: null, body: "" })}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, messageId: null })}>
        <DialogTitle>Delete Message</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this message? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, messageId: null })}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function MessageBubble({ msg, user, otherName, prevMsg, onEdit, onDelete }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const isMine = msg.sender === user?.id;
  const prevMsgSender = prevMsg?.sender;
  const showAvatar = !prevMsg || prevMsgSender !== msg.sender;

  const isImage = msg.attachment_url && /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.attachment_url);
  const isFile = msg.attachment_url && !isImage;

  return (
    <Box sx={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 0.5, mb: showAvatar ? 1 : 0.25 }}>
      {!isMine && showAvatar && (
        <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: "#175cdd", flexShrink: 0 }}>
          {(otherName || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
        </Avatar>
      )}
      <Box sx={{ maxWidth: "75%", display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start", position: "relative" }}>
        <Paper sx={{ px: 2, py: 1, bgcolor: isMine ? "#175cdd" : "#fff", color: isMine ? "#fff" : "#112344", borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          {msg.body && <Typography variant="body2" sx={{ wordBreak: "break-word" }}>{msg.body}</Typography>}
          {isImage && (
            <Box component="img" src={msg.attachment_url} sx={{ maxWidth: 240, maxHeight: 200, borderRadius: 1, mt: msg.body ? 1 : 0, display: "block", cursor: "pointer" }}
              onClick={() => window.open(msg.attachment_url, "_blank")} />
          )}
          {isFile && (
            <Box
              component="a"
              href={msg.attachment_url}
              target="_blank"
              rel="noopener"
              sx={{ display: "flex", alignItems: "center", gap: 1, mt: msg.body ? 1 : 0, color: isMine ? "#fff" : "#175cdd", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
            >
              <FileIcon sx={{ fontSize: 20 }} />
              <Typography variant="caption" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
                {msg.attachment_url.split("/").pop()}
              </Typography>
            </Box>
          )}
        </Paper>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25, px: 0.5 }}>
          <Typography variant="caption" color="text.disabled">
            {dayjs(msg.created_at).format("HH:mm")}
            {isMine && <span style={{ color: msg.is_read ? "#175cdd" : "inherit" }}>{msg.is_read ? " \u2713\u2713" : " \u2713"}</span>}
            {msg.edited_at && <span style={{ fontStyle: "italic", marginLeft: 2 }}>(edited)</span>}
          </Typography>
          {isMine && (
            <>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }} sx={{ p: 0, ml: 0.5 }}>
                <MoreVertIcon sx={{ fontSize: 14, color: "text.disabled" }} />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => { onEdit(); setAnchorEl(null); }}>
                  <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { onDelete(); setAnchorEl(null); }}>
                  <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Delete</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function ChatInput({ input, onChange, onKeyDown, onSend, inputRef, onFileClick }) {
  return (
    <Box sx={{ p: 1.5, bgcolor: "#fff", borderTop: "1px solid #e2e8f0", display: "flex", gap: 1, alignItems: "flex-end" }}>
      <IconButton onClick={onFileClick} size="small" sx={{ color: "text.secondary", mb: 0.5 }}>
        <AttachFileIcon />
      </IconButton>
      <TextField
        inputRef={inputRef}
        value={input}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="Type a message..."
        variant="outlined"
        fullWidth
        multiline
        maxRows={4}
        size="small"
        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
      />
      <IconButton onClick={onSend} disabled={!input.trim()} sx={{ bgcolor: "#175cdd", color: "#fff", "&:hover": { bgcolor: "#0f4ba0" }, "&:disabled": { bgcolor: "action.disabledBackground", color: "action.disabled" } }}>
        <SendIcon />
      </IconButton>
    </Box>
  );
}
