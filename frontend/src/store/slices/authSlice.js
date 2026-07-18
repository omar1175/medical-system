import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";

export const login = createAsyncThunk("auth/login", async (data, { rejectWithValue }) => {
  try {
    const res = await authService.login(data);
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data || { detail: "Login failed" });
  }
});

export const register = createAsyncThunk("auth/register", async (data, { rejectWithValue }) => {
  try {
    const res = await authService.register(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { detail: "Registration failed" });
  }
});

export const fetchMe = createAsyncThunk("auth/fetchMe", async (_, { rejectWithValue }) => {
  try {
    const res = await authService.getMe();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const updateMe = createAsyncThunk("auth/updateMe", async (data, { rejectWithValue }) => {
  try {
    const res = await authService.updateMe(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const confirmEmail = createAsyncThunk("auth/confirmEmail", async (params, { rejectWithValue }) => {
  try {
    const res = await authService.confirmEmail(params);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { detail: "Confirmation failed" });
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
    success: null,
    isAuthenticated: !!localStorage.getItem("access_token"),
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    },
    clearError(state) {
      state.error = null;
    },
    clearSuccess(state) {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.success = "Registration successful. Please check your email to confirm your account.";
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        const status = action.payload?.code;
        if (status === "token_not_valid" || action.meta?.aborted) {
          state.user = null;
          state.isAuthenticated = false;
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      })
      .addCase(updateMe.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(confirmEmail.pending, (state) => {
        state.loading = true;
      })
      .addCase(confirmEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.detail;
      })
      .addCase(confirmEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, clearSuccess } = authSlice.actions;
export default authSlice.reducer;
