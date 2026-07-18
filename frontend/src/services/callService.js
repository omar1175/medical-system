import api from "./api";

export const callService = {
  getCallInfo(appointmentId) {
    return api.get(`/calls/${appointmentId}/info/`);
  },
};
