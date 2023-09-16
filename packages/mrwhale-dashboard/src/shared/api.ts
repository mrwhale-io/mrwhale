import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { HttpStatusCode } from "@mrwhale-io/core";

export interface HttpApiError {
  message: string;
}

export interface HttpResponseError<T = HttpApiError> {
  status: HttpStatusCode;
  data: T;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: "/api/" }),
  endpoints: () => ({}),
});
