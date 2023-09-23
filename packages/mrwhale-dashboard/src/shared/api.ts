import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { HttpStatusCode } from "@mrwhale-io/core";

interface ValidationError {
  location: string;
  msg: string;
  path: string;
  type: string;
  value: string;
}

export interface HttpApiError {
  message: string;
}

export interface HttpApiValidationError {
  errors: { [field: string]: ValidationError };
}

export interface HttpResponseError<T = HttpApiError> {
  status: HttpStatusCode;
  data: T;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: "/api/" }),
  endpoints: () => ({}),
});
