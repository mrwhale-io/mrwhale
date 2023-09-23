import { createSlice } from "@reduxjs/toolkit";

import type { RootState } from "../../store";
import { User } from "../../types/user";
import { clientApi } from "./clientApi";

const CLIENT_FEATURE_KEY = "Client";

type ClientState = {
  user: User | null;
  clientId: string;
  userCount: number;
  version: string;
};

const slice = createSlice({
  name: CLIENT_FEATURE_KEY,
  initialState: {
    user: null,
    clientId: "",
    userCount: 0,
    version: "",
  } as ClientState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      clientApi.endpoints.getClientInfo.matchFulfilled,
      (state, { payload }) => {
        state.user = payload.user;
        state.clientId = payload.clientId;
        state.userCount = payload.userCount;
        state.version = payload.version;
      }
    );
  },
});

export default slice.reducer;

export const selectClientUser = (state: RootState) => state.client.user;
export const selectClientId = (state: RootState) => state.client.clientId;
export const selectUserCount = (state: RootState) => state.client.userCount;
export const selectVersion = (state: RootState) => state.client.version;
