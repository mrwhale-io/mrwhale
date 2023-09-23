import { api } from "../../shared/api";
import { Guild } from "../../types/guild";
import { User } from "../../types/user";

export interface CurrentUserResponse {
  user: User;
}

export interface UserGuildsResponse {
  guilds: Guild[];
}

export const usersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCurrentUser: build.mutation<CurrentUserResponse, void>({
      query: () => "users/current-user",
    }),
    getUserGuilds: build.query<UserGuildsResponse, void>({
      query: () => "users/current-user/guilds",
    }),
  }),
  overrideExisting: false,
});

export const { useGetCurrentUserMutation, useGetUserGuildsQuery } = usersApi;
