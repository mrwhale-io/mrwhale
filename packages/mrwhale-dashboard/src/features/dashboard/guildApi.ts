import { api } from "../../shared/api";
import { GuildManage } from "../../types/guild-manage";
import { Payload } from "../../types/payload";

interface GuildPrefixPayload extends Payload {
  prefix: string;
}

interface GuildLevelChannelPayload extends Payload {
  channelId: string;
}

interface SetLevelsResponse {
  status: boolean;
}

export const guildsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getGuildSettings: build.query<GuildManage, string>({
      query: (id) => `guilds/${id}`,
    }),
    deleteGuildData: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `guilds/${id}`,
        method: "DELETE"
      }),
    }),
    prefix: build.mutation<void, GuildPrefixPayload>({
      query: ({ id, ...details }) => ({
        url: `guilds/${id}/prefix`,
        method: "PATCH",
        body: details,
      }),
    }),
    levels: build.mutation<SetLevelsResponse, { id: string }>({
      query: ({ id, ...details }) => ({
        url: `guilds/${id}/levels`,
        method: "PATCH",
        body: details,
      }),
    }),
    levelChannel: build.mutation<void, GuildLevelChannelPayload>({
      query: ({ id, ...details }) => ({
        url: `guilds/${id}/level-channel`,
        method: "PATCH",
        body: details,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetGuildSettingsQuery,
  useDeleteGuildDataMutation,
  useLevelsMutation,
  useLevelChannelMutation,
  usePrefixMutation,
} = guildsApi;
