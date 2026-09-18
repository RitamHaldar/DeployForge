import { configureStore } from '@reduxjs/toolkit';
import authReducer from "../features/auth/auth.slice"
import gitReducer from "../features/github/github.slice"
export const store = configureStore({
  reducer: {
    auth:authReducer,
    git: gitReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;