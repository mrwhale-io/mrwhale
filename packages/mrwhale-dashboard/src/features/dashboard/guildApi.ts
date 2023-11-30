import { api } from "../../shared/api";
import { GuildManage } from "../../types/guild-manage";
import { Payload } from "../../types/payload";

interface GuildPrefixPayload extends Payload {
  prefix: string;
}

interface GuildLevelChannelPayload extends Payload {
  channelId: string;
}

interface RankCardPayload extends Payload {
  fillColour: string;
  primaryTextColour: string;
  secondaryTextColour: string;
  progressFillColour: string;
  progressColour: string;
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
        method: "DELETE",
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
    card: build.mutation<void, RankCardPayload>({
      query: ({ id, ...details }) => ({
        url: `guilds/${id}/card`,
        method: "PUT",
        body: details,
      }),
    }),
    resetCard: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `guilds/${id}/card`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useCardMutation,
  useGetGuildSettingsQuery,
  useDeleteGuildDataMutation,
  useLevelsMutation,
  useLevelChannelMutation,
  usePrefixMutation,
  useResetCardMutation,
} = guildsApi;
