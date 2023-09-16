import { api } from "../../shared/api";
import { Command } from "../../types/command";

interface CommandsResponse {
  commands: Command[];
}

export const commandsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCommands: build.query<CommandsResponse, void>({
      query: () => `commands`,
    }),
  }),
  overrideExisting: false,
});

export const { useGetCommandsQuery } = commandsApi;
