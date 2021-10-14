import * as glob from "glob";
import * as path from "path";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { COMMAND_TYPE_NAMES, loadCommand } from "@mrwhale-io/core";

import { clientId, token } from "../config.json";
import { DiscordCommand } from "../src/client/discord-command";

export function loadSlashCommands(): any[] {
  const commands = [];
  const files = [];
  for (const directory of COMMAND_TYPE_NAMES) {
    files.push(
      ...glob.sync(
        `${path.join(__dirname, `../src/commands/${directory}`)}/*.ts`
      )
    );
  }

  for (const file of files) {
    const commandLocation = file.replace(".ts", "");
    const loadedCommand: any = loadCommand(commandLocation, "DiscordCommand");
    const command: DiscordCommand = new loadedCommand();
    commands.push(command.slashCommandData.toJSON());
  }

  return commands;
}

const rest = new REST({ version: "9" }).setToken(token);

rest
  .put((Routes as any).applicationCommands(clientId), {
    body: loadSlashCommands(),
  })
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
