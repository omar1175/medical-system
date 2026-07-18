import api from "./api";

export const paymentService = {
  list: (params) => api.get("/payments/", { params }),
  get: (id) => api.get(`/payments/${id}/`),
  create: (data) => api.post("/payments/", data),
  getSubscriptionPlans: () => api.get("/subscriptions/plans/"),
  subscribe: (data) => api.post("/subscriptions/subscribe/", data),
  getSubscriptionStatus: () => api.get("/subscriptions/status/"),
  cancelSubscription: () => api.delete("/subscriptions/cancel/"),
};
