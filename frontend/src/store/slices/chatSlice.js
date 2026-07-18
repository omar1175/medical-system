import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { chatService } from "../../services/chatService";

export const fetchConversations = createAsyncThunk(
  "chats/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const res = await chatService.list();
      return res.data.results || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: "Failed to fetch conversations" });
    }
  },
);

export const fetchConversationDetail = createAsyncThunk(
  "chats/fetchConversationDetail",
  async (id, { rejectWithValue }) => {
    try {
      const res = await chatService.retrieve(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: "Failed to fetch conversation" });
    }
  },
);

export const createConversation = createAsyncThunk(
  "chats/createConversation",
  async (data, { rejectWithValue }) => {
    try {
      const res = await chatService.create(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: "Failed to create conversation" });
    }
  },
);

export const loadMoreMessages = createAsyncThunk(
  "chats/loadMoreMessages",
  async ({ conversationId, before }, { rejectWithValue }) => {
    try {
      const res = await chatService.listMessages(conversationId, { before, limit: 50 });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: "Failed to load messages" });
    }
  },
);

const chatSlice = createSlice({
  name: "chats",
  initialState: {
    conversations: [],
    activeConversation: null,
    messages: [],
    loading: false,
    loadingMore: false,
    error: null,
    typingUsers: {},
    onlineUsers: [],
    unreadTotal: 0,
    hasMore: true,
  },
  reducers: {
    setActiveConversation(state, action) {
      state.activeConversation = action.payload;
      state.typingUsers = {};
      state.messages = [];
      state.hasMore = true;
    },
    addMessage(state, action) {
      const exists = state.messages.some((m) => m.id === action.payload.id);
      if (!exists) {
        state.messages.push(action.payload);
      }
    },
    addMessages(state, action) {
      for (const msg of action.payload) {
        const exists = state.messages.some((m) => m.id === msg.id);
        if (!exists) {
          state.messages.push(msg);
        }
      }
    },
    setTypingUsers(state, action) {
      const { senderId, isTyping } = action.payload;
      if (isTyping) {
        state.typingUsers[senderId] = true;
      } else {
        delete state.typingUsers[senderId];
      }
    },
    setOnlineUsers(state, action) {
      state.onlineUsers = action.payload;
    },
    updateUnreadTotal(state, action) {
      state.unreadTotal = Math.max(0, state.unreadTotal + action.payload);
    },
    updateConversationLastMessage(state, action) {
      const { conversationId, message } = action.payload;
      const conv = state.conversations.find((c) => c.id === conversationId);
      if (conv) {
        conv.last_message = {
          id: message.id,
          body: message.body,
          sender_id: message.sender,
          sender_name: message.sender_name,
          attachment_url: message.attachment_url || null,
          created_at: message.created_at,
        };
        conv.updated_at = message.created_at;
      }
    },
    markMessageEdited(state, action) {
      const { messageId, body } = action.payload;
      const msg = state.messages.find((m) => String(m.id) === String(messageId));
      if (msg) {
        msg.body = body;
        msg.edited_at = new Date().toISOString();
      }
    },
    markMessageDeleted(state, action) {
      const { messageId } = action.payload;
      state.messages = state.messages.filter((m) => String(m.id) !== String(messageId));
    },
    clearActiveConversation(state) {
      state.activeConversation = null;
      state.messages = [];
      state.typingUsers = {};
      state.onlineUsers = [];
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchConversations.fulfilled, (s, a) => {
        s.loading = false;
        s.conversations = a.payload;
        s.unreadTotal = a.payload.reduce((sum, c) => sum + (c.unread_count || 0), 0);
      })
      .addCase(fetchConversations.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchConversationDetail.fulfilled, (s, a) => {
        s.activeConversation = a.payload;
        s.messages = a.payload.messages || [];
      })
      .addCase(createConversation.fulfilled, (s, a) => {
        s.conversations.unshift(a.payload);
      })
      .addCase(loadMoreMessages.pending, (s) => { s.loadingMore = true; })
      .addCase(loadMoreMessages.fulfilled, (s, a) => {
        s.loadingMore = false;
        const olderMessages = a.payload.messages || [];
        const existingIds = new Set(s.messages.map((m) => m.id));
        const newMessages = olderMessages.filter((m) => !existingIds.has(m.id));
        s.messages = [...newMessages, ...s.messages];
        s.hasMore = a.payload.has_more;
      })
      .addCase(loadMoreMessages.rejected, (s) => { s.loadingMore = false; });
  },
});

export const {
  setActiveConversation,
  addMessage,
  addMessages,
  setTypingUsers,
  setOnlineUsers,
  updateUnreadTotal,
  updateConversationLastMessage,
  markMessageEdited,
  markMessageDeleted,
  clearActiveConversation,
} = chatSlice.actions;

export default chatSlice.reducer;
