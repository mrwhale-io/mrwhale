import * as glob from "glob";
import * as path from "path";

import { COMMAND_TYPE_NAMES, loadCommand } from "@mrwhale-io/core";
import { DiscordCommand } from "../client/command/discord-command";

export function loadCommands(): DiscordCommand[] {
  const commands: DiscordCommand[] = [];
  const files: any[] = [];
  for (const directory of COMMAND_TYPE_NAMES) {
    files.push(
      ...glob.sync(`${path.join(__dirname, `../commands/${directory}`)}/*.ts`)
    );
  }

  for (const file of files) {
    const commandLocation = file.replace(".ts", "");
    const loadedCommand: any = loadCommand(commandLocation, "DiscordCommand");
    const command: DiscordCommand = new loadedCommand();

    commands.push(command);
  }

  return commands;
}
