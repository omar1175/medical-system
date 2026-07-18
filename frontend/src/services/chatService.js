import api from "./api";

const BASE = "/conversations";

export const chatService = {
  list: (params = {}) => api.get(BASE, { params }),
  retrieve: (id) => api.get(`${BASE}/${id}/`),
  create: (data) => api.post(BASE, data),
  sendMessage: (id, body) =>
    api.post(`${BASE}/${id}/send_message/`, { body }),
  sendFile: (id, formData) =>
    api.post(`${BASE}/${id}/send_file/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  editMessage: (conversationId, messageId, body) =>
    api.post(`${BASE}/${conversationId}/messages/${messageId}/edit/`, { body }),
  deleteMessage: (conversationId, messageId) =>
    api.post(`${BASE}/${conversationId}/messages/${messageId}/delete/`),
  markRead: (id) => api.post(`${BASE}/${id}/mark_read/`),
  getUnreadCount: (id) => api.get(`${BASE}/${id}/unread_count/`),
  listMessages: (id, params = {}) => api.get(`${BASE}/${id}/messages/`, { params }),
};

export default chatService;
