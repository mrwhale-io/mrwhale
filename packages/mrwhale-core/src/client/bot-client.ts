import { CommandLoader } from "./command/command-loader";
import { logger } from "../util/logger";
import { BotOptions } from "../types/bot-options";
import { CommandStorage } from "./command/command-storage";
import { Command } from "./command/command";
import { StorageProviderConstructor } from "../types/storage-provider-constructor";
import { SqliteStorageProvider } from '../storage/sqlite-storage-provider';

/**
 * Base class to extend bot client integrations from.
 */
export abstract class BotClient<T extends Command<any> = Command<any>> {
  /**
   * Default prefix denoting a command call.
   */
  defaultPrefix: string;

  /**
   * Contains the time the bot started.
   */
  startTime: number;

  /**
   * The user identifier of the bot owner.
   */
  ownerId: number | string;

  /**
   * The commands directory.
   */
  commandsDir: string;

  /**
   * The storage provider.
   */
  readonly provider: StorageProviderConstructor;

  /**
   * Bot client logging instance.
   */
  readonly logger = logger;

  /**
   * Contains the command registry.
   */
  readonly commands: CommandStorage<this, T>;

  /**
   * Contains the command loader.
   */
  protected commandLoader: CommandLoader;

  constructor(options: BotOptions) {
    this.commandsDir = options.commandsDir;
    this.defaultPrefix = options.prefix;
    this.ownerId = options.ownerId;
    this.provider = options.provider ?? SqliteStorageProvider();
    this.commands = new CommandStorage<this, T>();
    this.commandLoader = new CommandLoader(this);
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
