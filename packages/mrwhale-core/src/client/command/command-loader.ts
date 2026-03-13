import * as glob from "glob";
import * as path from "path";

import { BotClient } from "../bot-client";
import { COMMAND_TYPE_NAMES } from "../../constants";
import { loadCommand } from "../../util/load-command";
import { Command } from "./command";

/**
 * A utility class responsible for loading, managing, and reloading bot commands.
 *
 * The CommandLoader handles the discovery and instantiation of command files from
 * the commands directory, supporting both JavaScript and TypeScript files when
 * ts-node is enabled. It maintains a count of loaded commands and provides
 * functionality to reload individual commands at runtime.
 *
 * @example
 * ```typescript
 * const loader = new CommandLoader(botClient);
 * loader.loadCommands();
 * console.log(`Loaded ${loader.loadedCommands} commands`);
 *
 * // Reload a specific command
 * const reloaded = loader.reloadCommand('ping');
 * ```
 */
export class CommandLoader {
  /**
   * The number of commands that have been loaded by this CommandLoader instance.
   */
  get loadedCommands(): number {
    return this._loadedCommands;
  }

  /**
   * The type of commands being loaded, used for logging and error messages.
   * This is typically set to the name of the Command class or a specific command type.
   */
  set commandType(value: string) {
    this._commandType = value;
  }

  private _commandType: string;
  private _loadedCommands: number;
  private botClient: BotClient;

  constructor(bot: BotClient) {
    this.botClient = bot;
    this._loadedCommands = 0;
    this._commandType = Command.name;
  }

  /**
   * Loads all commands from the commands directory into the bot client.
   *
   * This method scans through all command type directories, discovers command files
   * (both .js and .ts if tsNode is enabled), instantiates each command, and registers
   * them with the bot client. If commands are already loaded, they will be cleared
   * before loading new ones.
   *
   * @remarks
   * - Clears existing commands if any are already loaded
   * - Supports both JavaScript (.js) and TypeScript (.ts) files
   * - TypeScript files are only loaded when `tsNode` is enabled
   * - Each command is instantiated and registered with the bot client
   * - Logs successful loading of each command
   *
   * @throws May throw errors if command files cannot be loaded or instantiated
   */
  loadCommands(): void {
    if (this.botClient.commands.size > 0) {
      this.botClient.commands.clear();
      this._loadedCommands = 0;
    }

    const files = [];
    for (const directory of COMMAND_TYPE_NAMES) {
      files.push(
        ...glob.sync(
          `${path.join(this.botClient.commandsDir, directory)}/*.js`,
        ),
      );

      // Only load TypeScript command files if ts-node is enabled
      // This allows for development in Ts-Node environments without affecting production environments where commands are compiled to JavaScript.
      if (this.botClient.tsNode) {
        files.push(
          ...glob.sync(
            `${path.join(this.botClient.commandsDir, directory)}/*.ts`,
          ),
        );
      }
    }

    for (const file of files) {
      const commandLocation = file.replace(".ts", "");
      const loadedCommand: any = loadCommand(
        commandLocation,
        this._commandType,
      );
      const command: Command<any> = new loadedCommand(this.botClient);
      this.botClient.commands.register(
        this.botClient,
        command,
        command.name,
        commandLocation,
      );

      this._loadedCommands++;
      this.botClient.logger.info(`Command ${command.name} loaded`);
    }
  }

  /**
   * Reloads a command by its name or alias.
   *
   * This method finds a command by name or alias, retrieves its location,
   * loads it fresh from disk, creates a new instance, and re-registers it
   * with the bot client, effectively reloading the command.
   *
   * @param commandNameOrAlias - The name or alias of the command to reload
   * @returns True if the command was successfully reloaded, false otherwise
   */
  reloadCommand(commandNameOrAlias: string): boolean {
    const command =
      this.botClient.commands.findByNameOrAlias(commandNameOrAlias);

    if (!command) {
      return false;
    }

    const commandLocation = this.botClient.commands.get(
      command.name,
    ).commandLocation;
    const loadedCommand: any = loadCommand(commandLocation, this.commandType);
    const cmd: Command<any> = new loadedCommand(this.botClient);
    this.botClient.commands.register(
      this.botClient,
      cmd,
      cmd.name,
      commandLocation,
      true,
    );

    return true;
  }
}
