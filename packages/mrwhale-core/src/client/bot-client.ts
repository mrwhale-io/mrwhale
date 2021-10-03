import { Command } from "./command";
import { CommandLoader } from "./command-loader";
import { logger } from "../util/logger";
import { BotOptions } from "../types/bot-options";

/**
 * Base class to extend bot client integrations from.
 */
export abstract class BotClient<T> {
  /**
   * Contains the bot commands.
   */
  commands: Command<T>[] = [];

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
   * The bot integration client.
   */
  client: T;

  /**
   * Bot client logging instance.
   */
  readonly logger = logger;

  /**
   * Contains the command loader.
   */
  protected commandLoader: CommandLoader;

  constructor(options: BotOptions) {
    this.defaultPrefix = options.prefix;
    this.ownerId = options.ownerId;
  }

  /**
   * Reloads a command or all commands for the bot client.
   *
   * @param command The name of the command to reload.
   */
  reloadCommand(command: string): void {
    if (!command) {
      throw new Error(`A command name or 'all' must be provided.`);
    }

    if (command === "all") {
      this.commandLoader.loadCommands();
    } else {
      this.commandLoader.reloadCommand(command);
    }
  }
}
