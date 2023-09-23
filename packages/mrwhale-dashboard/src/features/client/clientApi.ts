import { api } from "../../shared/api";
import { User } from "../../types/user";

interface ClientResponse {
  user: User | null;
  clientId: string;
  userCount: number;
  version: string;
}

export const clientApi = api.injectEndpoints({
  endpoints: (build) => ({
    getClientInfo: build.mutation<ClientResponse, void>({
      query: () => `client`,
    }),
  }),
  overrideExisting: false,
});

export const { useGetClientInfoMutation } = clientApi;
