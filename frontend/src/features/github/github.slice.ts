import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { GitResponse } from "../auth";

export interface GitState {
  repos: GitResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: GitState = {
  repos: [],
  loading: false,
  error: null
};

const GitSlice = createSlice({
  name: "Git",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setRepos: (state, action: PayloadAction<GitResponse[]>) => {
      state.repos = action.payload;
      state.loading = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const { setLoading, setRepos, setError} = GitSlice.actions;
export default GitSlice.reducer;