import { CommandLoader } from "./command/command-loader";
import { logger } from "../util/logger";
import { BotOptions } from "../types/bot-options";
import { CommandStorage } from "./command/command-storage";
import { Command } from "./command/command";
import { StorageProviderConstructor } from "../types/storage-provider-constructor";
import { SqliteStorageProvider } from "../storage/sqlite-storage-provider";

/**
 * Abstract base class for bot clients that provides core functionality for command management,
 * storage, and client configuration. This class serves as the foundation for platform-specific
 * bot implementations.
 *
 * @template T - The command type that extends Command, defaults to Command<any>
 *
 * @example
 * ```typescript
 * class MyBot extends BotClient<MyCommand> {
 *   async getPrefix(id?: string): Promise<string> {
 *     return this.defaultPrefix;
 *   }
 * }
 *
 * const bot = new MyBot({
 *   commandsDir: './commands',
 *   prefix: '!',
 *   ownerId: '123456789'
 * });
 * ```
 */
export abstract class BotClient<T extends Command<any> = Command<any>> {
  /**
   * The default prefix for commands.
   */
  defaultPrefix: string;

  /**
   * The timestamp when the bot started.
   */
  startTime: number;

  /**
   * The user identifier of the bot owner.
   */
  ownerId: number | string;

  /**
   * The directory where command files are located.
   */
  commandsDir: string;

  /**
   * Whether the client is running in ts-node.
   * This is determined by checking for the presence of the ts-node register instance symbol in the process object.
   */
  readonly tsNode: boolean;

  /**
   * The storage provider constructor to use for the bot's storage needs. This allows for flexible storage solutions, with a default of SqliteStorageProvider if none is provided in the options.
   */
  readonly provider: StorageProviderConstructor;

  /**
   * The logger instance for the bot client, used for logging messages and errors throughout the bot's operation.
   */
  readonly logger = logger;

  /**
   * Contains the command storage system for managing bot commands. This is an instance of CommandStorage that allows for registering, retrieving, and managing commands within the bot client.
   */
  readonly commands: CommandStorage<this, T>;

  /**
   * The command loader responsible for loading and reloading commands from the file system. This instance of CommandLoader provides methods to load all commands or reload specific commands by name, facilitating dynamic command management without needing to restart the bot.
   */
  protected commandLoader: CommandLoader;

  constructor(options: BotOptions) {
    this.commandsDir = options.commandsDir;
    this.defaultPrefix = options.prefix;
    this.ownerId = options.ownerId;
    this.provider = options.provider ?? SqliteStorageProvider();
    this.commands = new CommandStorage<this, T>();
    this.commandLoader = new CommandLoader(this);

    if (process[Symbol.for("ts-node.register.instance")]) {
      this.tsNode = true;
    }
  }

  /**
   * Gets the room prefix.
   *
   * @param id The id of the prefix.
   */
  abstract getPrefix(id?: unknown): string | Promise<string>;

  /**
   * Reloads a command or all commands for the bot client.
   *
   * @param command The name of the command to reload.
   */
  reloadCommand(command: string): void {
    if (!command) {
      throw new Error(`A command name or 'all' must be provided.`);
    }

    command === "all"
      ? this.commandLoader.loadCommands()
      : this.commandLoader.reloadCommand(command);
  }
}
