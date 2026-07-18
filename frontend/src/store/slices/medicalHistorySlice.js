import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { medicalHistoryService } from "../../services/medicalHistoryService";

export const fetchMedicalHistory = createAsyncThunk(
  "medicalHistory/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const res = await medicalHistoryService.list(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const fetchMedicalRecord = createAsyncThunk(
  "medicalHistory/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const res = await medicalHistoryService.get(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const createMedicalRecord = createAsyncThunk(
  "medicalHistory/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await medicalHistoryService.create(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const updateMedicalRecord = createAsyncThunk(
  "medicalHistory/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await medicalHistoryService.update(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const fetchPatientSummary = createAsyncThunk(
  "medicalHistory/patientSummary",
  async (patientId, { rejectWithValue }) => {
    try {
      const res = await medicalHistoryService.getPatientSummary(patientId);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

const medicalHistorySlice = createSlice({
  name: "medicalHistory",
  initialState: {
    list: [],
    currentRecord: null,
    patientSummary: null,
    count: 0,
    listLoading: false,
    summaryLoading: false,
    createLoading: false,
    updateLoading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearMedicalHistoryError(state) {
      state.error = null;
    },
    clearMedicalHistorySuccess(state) {
      state.success = null;
    },
    clearCurrentRecord(state) {
      state.currentRecord = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedicalHistory.pending, (s) => {
        s.listLoading = true;
        s.error = null;
      })
      .addCase(fetchMedicalHistory.fulfilled, (s, a) => {
        s.listLoading = false;
        s.list = a.payload.results || a.payload;
        s.count = a.payload.count || 0;
      })
      .addCase(fetchMedicalHistory.rejected, (s, a) => {
        s.listLoading = false;
        s.error = a.payload;
      })
      .addCase(fetchMedicalRecord.pending, (s) => {
        s.listLoading = true;
        s.error = null;
      })
      .addCase(fetchMedicalRecord.fulfilled, (s, a) => {
        s.listLoading = false;
        s.currentRecord = a.payload;
      })
      .addCase(fetchMedicalRecord.rejected, (s, a) => {
        s.listLoading = false;
        s.error = a.payload;
      })
      .addCase(createMedicalRecord.pending, (s) => {
        s.createLoading = true;
        s.error = null;
      })
      .addCase(createMedicalRecord.fulfilled, (s, a) => {
        s.createLoading = false;
        s.list.unshift(a.payload);
        s.success = "Medical record created successfully.";
      })
      .addCase(createMedicalRecord.rejected, (s, a) => {
        s.createLoading = false;
        s.error = a.payload;
      })
      .addCase(updateMedicalRecord.pending, (s) => {
        s.updateLoading = true;
        s.error = null;
      })
      .addCase(updateMedicalRecord.fulfilled, (s, a) => {
        s.updateLoading = false;
        const idx = s.list.findIndex((r) => r.id === a.payload.id);
        if (idx !== -1) s.list[idx] = a.payload;
        if (s.currentRecord?.id === a.payload.id) s.currentRecord = a.payload;
        s.success = "Medical record updated successfully.";
      })
      .addCase(updateMedicalRecord.rejected, (s, a) => {
        s.updateLoading = false;
        s.error = a.payload;
      })
      .addCase(fetchPatientSummary.pending, (s) => {
        s.summaryLoading = true;
        s.error = null;
      })
      .addCase(fetchPatientSummary.fulfilled, (s, a) => {
        s.summaryLoading = false;
        s.patientSummary = a.payload;
      })
      .addCase(fetchPatientSummary.rejected, (s, a) => {
        s.summaryLoading = false;
        s.error = a.payload;
      });
  },
});

export const {
  clearMedicalHistoryError,
  clearMedicalHistorySuccess,
  clearCurrentRecord,
} = medicalHistorySlice.actions;
export default medicalHistorySlice.reducer;
