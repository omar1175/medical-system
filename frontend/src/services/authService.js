import api from "./api";

export const authService = {
  login: (data) => api.post("/auth/login/", data),
  register: (data) => api.post("/auth/register/", data),
  getMe: () => api.get("/auth/me/"),
  updateMe: (data) => api.patch("/auth/me/", data),
  changePassword: (data) => api.post("/auth/change-password/", data),
  confirmEmail: (params) => api.get("/auth/confirm-email/", { params }),
  resendEmail: (data) => api.post("/auth/resend-email/", data),
  refreshToken: (data) => api.post("/auth/refresh/", data),
  adminUpdateUser: (id, data) => api.patch(`/users/${id}/`, data),
  requestPasswordReset: (data) => api.post("/auth/password-reset/", data),
  confirmPasswordReset: (data) => api.post("/auth/password-reset-confirm/", data),
};
