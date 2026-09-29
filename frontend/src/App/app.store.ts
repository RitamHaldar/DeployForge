import { configureStore } from '@reduxjs/toolkit';
import authReducer from "../features/auth/auth.slice"
import gitReducer from "../features/github/github.slice"
import deploymentReducer from "../features/deployment/deployment.slice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    git: gitReducer,
    deployment: deploymentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;