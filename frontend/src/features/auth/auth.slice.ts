import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthApiError, AuthState, AuthUser } from "./types";

const initialState: AuthState = {
    user: null,
    isLoading: false,
    error: null,
};
export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setUser: (state, action: PayloadAction<{ user: AuthUser }>) => {
            state.user = action.payload.user;
        },
        setError: (state, action: PayloadAction<AuthApiError | string | null>) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        logout: (state) => {
            state.user = null;
            state.error = null;
            state.isLoading = false;
        },

    }

})
export const { setLoading , setError, setUser} =authSlice.actions;
export default authSlice.reducer;