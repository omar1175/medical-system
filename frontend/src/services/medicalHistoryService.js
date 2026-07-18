import api from "./api";

export const medicalHistoryService = {
  list: (params) => api.get("/medical-history/", { params }),
  get: (id) => api.get(`/medical-history/${id}/`),
  create: (data) => api.post("/medical-history/", data),
  update: (id, data) => api.patch(`/medical-history/${id}/`, data),
  getPatientSummary: (patientId) =>
    api.get("/medical-history/patient-summary/", {
      params: { patient_id: patientId },
    }),
};
