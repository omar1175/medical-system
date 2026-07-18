import api from "./api";

const BASE = "/api/v1/agent";

export const agentService = {
  chat: (data) => api.post(`${BASE}/chat/`, data),
  history: () => api.get(`${BASE}/history/`),
};

export default agentService;
