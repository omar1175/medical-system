import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { appointmentService } from "../../services/appointmentService";

export const fetchAppointments = createAsyncThunk(
  "appointments/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const res = await appointmentService.list(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const createAppointment = createAsyncThunk(
  "appointments/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await appointmentService.create(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  "appointments/cancel",
  async ({ id, notes }, { rejectWithValue }) => {
    try {
      const res = await appointmentService.cancel(id, notes);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const confirmAppointment = createAsyncThunk(
  "appointments/confirm",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await appointmentService.confirm(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const completeAppointment = createAsyncThunk(
  "appointments/complete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await appointmentService.complete(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const rescheduleAppointment = createAsyncThunk(
  "appointments/reschedule",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await appointmentService.reschedule(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

const appointmentsSlice = createSlice({
  name: "appointments",
  initialState: {
    list: [],
    count: 0,
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearAppointmentError(state) {
      state.error = null;
    },
    clearAppointmentSuccess(state) {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchAppointments.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload.results || a.payload;
        s.count = a.payload.count || 0;
      })
      .addCase(fetchAppointments.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createAppointment.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createAppointment.fulfilled, (s, a) => {
        s.loading = false;
        s.list.unshift(a.payload);
        s.success = "Appointment booked successfully.";
      })
      .addCase(createAppointment.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(cancelAppointment.fulfilled, (s, a) => {
        const idx = s.list.findIndex((ap) => ap.id === a.payload.id);
        if (idx !== -1) s.list[idx] = a.payload;
      })
      .addCase(cancelAppointment.rejected, (s, a) => { s.error = a.payload; })
      .addCase(confirmAppointment.fulfilled, (s, a) => {
        const idx = s.list.findIndex((ap) => ap.id === a.payload.id);
        if (idx !== -1) s.list[idx] = a.payload;
      })
      .addCase(confirmAppointment.rejected, (s, a) => { s.error = a.payload; })
      .addCase(completeAppointment.fulfilled, (s, a) => {
        const idx = s.list.findIndex((ap) => ap.id === a.payload.id);
        if (idx !== -1) s.list[idx] = a.payload;
      })
      .addCase(completeAppointment.rejected, (s, a) => { s.error = a.payload; })
      .addCase(rescheduleAppointment.pending, (s) => { s.loading = true; s.error = null; s.success = null; })
      .addCase(rescheduleAppointment.fulfilled, (s, a) => {
        s.loading = false;
        const idx = s.list.findIndex((ap) => ap.id === a.payload.id);
        if (idx !== -1) s.list[idx] = a.payload;
        s.success = "Appointment rescheduled successfully.";
      })
      .addCase(rescheduleAppointment.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { clearAppointmentError, clearAppointmentSuccess } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;
