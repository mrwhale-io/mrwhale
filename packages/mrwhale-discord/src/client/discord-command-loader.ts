import {
  CommandLoader,
  COMMAND_TYPE_NAMES,
  loadCommand,
} from "@mrwhale-io/core";
import * as glob from "glob";
import * as path from "path";

import { DiscordBotClient } from "./discord-bot-client";
import { DiscordCommand } from "./discord-command";

/**
 * Responsible for loading and registering commands.
 */
export class DiscordCommandLoader implements CommandLoader {
  /**
   * Count of the loaded commands.
   */
  loadedCommands: number;

  private botClient: DiscordBotClient;

  constructor(bot: DiscordBotClient) {
    this.botClient = bot;
    this.loadedCommands = 0;
  }

  /**
   * Loads all commands from the commands directory.
   */
  loadCommands(): void {
    if (this.botClient.commands.length > 0) {
      this.botClient.commands = [];
      this.loadedCommands = 0;
    }

    const files = [];
    for (const directory of COMMAND_TYPE_NAMES) {
      files.push(
        ...glob.sync(`${path.join(__dirname, `../commands/${directory}`)}/*.ts`)
      );
    }

    for (const file of files) {
      const commandLocation = file.replace(".ts", "");
      const loadedCommand: any = loadCommand(commandLocation, "DiscordCommand");
      const command: DiscordCommand = new loadedCommand();

      command.register(this.botClient, commandLocation);

      this.loadedCommands++;
      this.botClient.logger.info(`Command ${command.name} loaded`);
    }
  }

  /**
   * Reloads a command.
   * @param commandName The name of the command to reload.
   */
  reloadCommand(commandName: string): boolean {
    const cmdIndex = this.botClient.commands.findIndex(
      (cmd) => cmd.name === commandName
    );

    if (cmdIndex === -1) {
      return false;
    }

    const loadedCommandType: any = loadCommand(
      this.botClient.commands[cmdIndex].commandLocation,
      "DiscordCommand"
    );
    const loadedCommand: DiscordCommand = new loadedCommandType();
    this.botClient.commands[cmdIndex].register(
      this.botClient,
      loadedCommand.commandLocation
    );
    this.botClient.commands[cmdIndex] = loadedCommand;
    this.botClient.logger.info(`Command ${loadedCommand.name} reloaded`);

    return true;
  }
}
