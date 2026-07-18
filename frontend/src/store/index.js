import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import doctorsReducer from "./slices/doctorsSlice";
import appointmentsReducer from "./slices/appointmentsSlice";
import medicalHistoryReducer from "./slices/medicalHistorySlice";
import paymentsReducer from "./slices/paymentsSlice";
import chatsReducer from "./slices/chatSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    doctors: doctorsReducer,
    appointments: appointmentsReducer,
    medicalHistory: medicalHistoryReducer,
    payments: paymentsReducer,
    chats: chatsReducer,
  },
});

export default store;
