
import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice'
import chatReducer from './slices/chatSlice'
import userReducer from "./slices/userSlice";
// import chatReducer from "../chatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
   
    chat: chatReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
