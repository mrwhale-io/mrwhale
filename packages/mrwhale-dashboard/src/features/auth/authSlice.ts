import { createSlice } from "@reduxjs/toolkit";

import type { RootState } from "../../store";
import { User } from "../../types/user";
import { usersApi } from "../users/usersApi";

const AUTH_FEATURE_KEY = "auth";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isInitialLoad: boolean;
};

const slice = createSlice({
  name: AUTH_FEATURE_KEY,
  initialState: {
    user: null,
    isAuthenticated: false,
    isInitialLoad: true,
  } as AuthState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        usersApi.endpoints.getCurrentUser.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.user;
          state.isAuthenticated = true;
          state.isInitialLoad = false;
        }
      )
      .addMatcher(usersApi.endpoints.getCurrentUser.matchRejected, (state) => {
        state.isInitialLoad = false;
      });
  },
});

export default slice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectIsInitialLoad = (state: RootState) =>
  state.auth.isInitialLoad;
