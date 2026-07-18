import api from "./api";

export const doctorService = {
  list: (params) => api.get("/doctors/", { params }),
  get: (id) => api.get(`/doctors/${id}/`),
  getMe: () => api.get("/doctors/me/"),
  updateMe: (data) => api.patch("/doctors/me/", data),
  listSpecialties: () => api.get("/specialties/"),
  createSpecialty: (data) => api.post("/specialties/", data),
  updateSpecialty: (slug, data) => api.put(`/specialties/${slug}/`, data),
  deleteSpecialty: (slug) => api.delete(`/specialties/${slug}/`),
  listAvailability: () => api.get("/availability/"),
  createAvailability: (data) => api.post("/availability/", data),
  deleteAvailability: (id) => api.delete(`/availability/${id}/`),
  approveDoctor: (id, data) => api.patch(`/doctors/${id}/approve/`, data),
};
