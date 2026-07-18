import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { paymentService } from "../../services/paymentService";

export const fetchPayments = createAsyncThunk(
  "payments/fetchPayments",
  async (params, { rejectWithValue }) => {
    try {
      const res = await paymentService.list(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchPayment = createAsyncThunk(
  "payments/fetchPayment",
  async (id, { rejectWithValue }) => {
    try {
      const res = await paymentService.get(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createPayment = createAsyncThunk(
  "payments/createPayment",
  async (data, { rejectWithValue }) => {
    try {
      const res = await paymentService.create(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchSubscriptionPlans = createAsyncThunk(
  "payments/fetchSubscriptionPlans",
  async (_, { rejectWithValue }) => {
    try {
      const res = await paymentService.getSubscriptionPlans();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const subscribe = createAsyncThunk(
  "payments/subscribe",
  async (data, { rejectWithValue }) => {
    try {
      const res = await paymentService.subscribe(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchSubscriptionStatus = createAsyncThunk(
  "payments/fetchSubscriptionStatus",
  async (_, { rejectWithValue }) => {
    try {
      const res = await paymentService.getSubscriptionStatus();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  "payments/cancelSubscription",
  async (_, { rejectWithValue }) => {
    try {
      const res = await paymentService.cancelSubscription();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const initialState = {
  payments: [],
  count: 0,
  currentPayment: null,
  subscriptionPlans: [],
  currentSubscription: null,
  loading: false,
  error: null,
  success: null,
};

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    clearPaymentSuccess: (state) => {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.results || action.payload;
        state.count = action.payload.count || 0;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
      })
      .addCase(fetchPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Payment created successfully";
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSubscriptionPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptionPlans = action.payload.results || action.payload;
      })
      .addCase(fetchSubscriptionPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSubscriptionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubscription = action.payload;
      })
      .addCase(fetchSubscriptionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(subscribe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(subscribe.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubscription = action.payload;
        state.success = "Subscription created";
      })
      .addCase(subscribe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state) => {
        state.loading = false;
        state.currentSubscription = null;
        state.success = "Subscription cancelled";
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPaymentError, clearPaymentSuccess } = paymentsSlice.actions;
export default paymentsSlice.reducer;
