import api from "./api";

export const appointmentService = {
  list: (params) => api.get("/appointments/", { params }),
  get: (id) => api.get(`/appointments/${id}/`),
  create: (data) => api.post("/appointments/", data),
  updateStatus: (id, data) => api.post(`/appointments/${id}/update_status/`, data),
  cancel: (id) =>
    api.post(`/appointments/${id}/update_status/`, { status: "CANCELLED" }),
  confirm: (id, data) =>
    api.post(`/appointments/${id}/update_status/`, { status: "CONFIRMED", ...data }),
  complete: (id) =>
    api.post(`/appointments/${id}/update_status/`, { status: "COMPLETED" }),
  reschedule: (id, data) => api.post(`/appointments/${id}/reschedule/`, data),
};
