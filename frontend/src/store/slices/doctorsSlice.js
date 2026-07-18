import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { doctorService } from "../../services/doctorService";

export const fetchDoctors = createAsyncThunk(
  "doctors/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const res = await doctorService.list(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const fetchDoctor = createAsyncThunk(
  "doctors/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const res = await doctorService.get(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const fetchSpecialties = createAsyncThunk(
  "doctors/fetchSpecialties",
  async (_, { rejectWithValue }) => {
    try {
      const res = await doctorService.listSpecialties();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const createSpecialty = createAsyncThunk(
  "doctors/createSpecialty",
  async (data, { rejectWithValue }) => {
    try {
      const res = await doctorService.createSpecialty(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const deleteSpecialty = createAsyncThunk(
  "doctors/deleteSpecialty",
  async (slug, { rejectWithValue }) => {
    try {
      await doctorService.deleteSpecialty(slug);
      return slug;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const updateSpecialty = createAsyncThunk(
  "doctors/updateSpecialty",
  async ({ slug, data }, { rejectWithValue }) => {
    try {
      const res = await doctorService.updateSpecialty(slug, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const fetchMyProfile = createAsyncThunk(
  "doctors/fetchMyProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await doctorService.getMe();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const updateMyProfile = createAsyncThunk(
  "doctors/updateMyProfile",
  async (data, { rejectWithValue }) => {
    try {
      const res = await doctorService.updateMe(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const fetchAvailability = createAsyncThunk(
  "doctors/fetchAvailability",
  async (_, { rejectWithValue }) => {
    try {
      const res = await doctorService.listAvailability();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const createAvailability = createAsyncThunk(
  "doctors/createAvailability",
  async (data, { rejectWithValue }) => {
    try {
      const res = await doctorService.createAvailability(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const deleteAvailability = createAsyncThunk(
  "doctors/deleteAvailability",
  async (id, { rejectWithValue }) => {
    try {
      await doctorService.deleteAvailability(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

const doctorsSlice = createSlice({
  name: "doctors",
  initialState: {
    list: [],
    count: 0,
    current: null,
    specialties: [],
    myProfile: null,
    availability: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearDoctorError(state) {
      state.error = null;
    },
    clearCurrent(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchDoctors.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload.results || a.payload;
        s.count = a.payload.count || 0;
      })
      .addCase(fetchDoctors.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchDoctor.pending, (s) => { s.loading = true; })
      .addCase(fetchDoctor.fulfilled, (s, a) => { s.loading = false; s.current = a.payload; })
      .addCase(fetchDoctor.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchSpecialties.fulfilled, (s, a) => {
        s.specialties = a.payload.results || a.payload;
      })
      .addCase(createSpecialty.fulfilled, (s, a) => {
        s.specialties.push(a.payload);
      })
      .addCase(deleteSpecialty.fulfilled, (s, a) => {
        s.specialties = s.specialties.filter((sp) => sp.slug !== a.payload);
      })
      .addCase(updateSpecialty.fulfilled, (s, a) => {
        const idx = s.specialties.findIndex((sp) => sp.slug === a.payload.slug);
        if (idx !== -1) s.specialties[idx] = a.payload;
      })
      .addCase(fetchMyProfile.fulfilled, (s, a) => { s.myProfile = a.payload; })
      .addCase(updateMyProfile.fulfilled, (s, a) => { s.myProfile = a.payload; })
      .addCase(fetchAvailability.fulfilled, (s, a) => {
        s.availability = a.payload.results || a.payload;
      })
      .addCase(createAvailability.fulfilled, (s, a) => {
        s.availability.push(a.payload);
      })
      .addCase(deleteAvailability.fulfilled, (s, a) => {
        s.availability = s.availability.filter((av) => av.id !== a.payload);
      });
  },
});

export const { clearDoctorError, clearCurrent } = doctorsSlice.actions;
export default doctorsSlice.reducer;
