import * as glob from "glob";
import * as path from "path";

import { BotClient } from "../bot-client";
import { COMMAND_TYPE_NAMES } from "../../constants";
import { loadCommand } from "../../util/load-command";
import { Command } from "./command";

/**
 * Responsible for loading commands from a directory.
 */
export class CommandLoader {
  /**
   * Count of the loaded commands.
   */
  loadedCommands: number;

  /**
   * The name of the command class to load.
   */
  set commandType(value: string) {
    this._commandType = value;
  }

  private _commandType: string;
  private botClient: BotClient;

  constructor(bot: BotClient) {
    this.botClient = bot;
    this.loadedCommands = 0;
    this._commandType = Command.name;
  }

  /**
   * Loads all commands from the commands directory.
   */
  loadCommands(): void {
    if (this.botClient.commands.size > 0) {
      this.botClient.commands.clear();
      this.loadedCommands = 0;
    }

    const files = [];
    for (const directory of COMMAND_TYPE_NAMES) {
      files.push(
        ...glob.sync(`${path.join(this.botClient.commandsDir, directory)}/*.ts`)
      );
    }

    for (const file of files) {
      const commandLocation = file.replace(".ts", "");
      const loadedCommand: any = loadCommand(
        commandLocation,
        this._commandType
      );
      const command: Command<any> = new loadedCommand(this.botClient);
      this.botClient.commands.register(
        this.botClient,
        command,
        command.name,
        commandLocation
      );

      this.loadedCommands++;
      this.botClient.logger.info(`Command ${command.name} loaded`);
    }
  }

  /**
   * Reloads a command.
   *
   * @param commandName The name of the command to reload.
   */
  reloadCommand(commandName: string): boolean {
    const name = this.botClient.commands.findByNameOrAlias(commandName).name;
    if (!name) {
      return false;
    }

    const commandLocation = this.botClient.commands.get(name).commandLocation;
    const loadedCommand: any = loadCommand(commandLocation, this.commandType);
    const cmd: Command<any> = new loadedCommand(this.botClient);
    this.botClient.commands.register(
      this.botClient,
      cmd,
      cmd.name,
      commandLocation,
      true
    );
    return false;
  }
}
