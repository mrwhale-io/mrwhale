import { configureStore } from "@reduxjs/toolkit";

import { api } from "./shared/api";
import authReducer from "./features/auth/authSlice";
import clientReducer from "./features/client/clientSlice";
import { clientApi } from "./features/client/clientApi";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [clientApi.reducerPath]: clientApi.reducer,
    client: clientReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
