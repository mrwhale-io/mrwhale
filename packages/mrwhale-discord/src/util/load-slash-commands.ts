import { RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";

import { loadCommands } from "./load-commands";

export function loadSlashCommands(): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
  const slashCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
  const commands = loadCommands();

  for (const command of commands) {
    if (command.slashCommandAction) {
      slashCommands.push(command.slashCommandData.toJSON());
    }
  }

  return slashCommands;
}
