import { CommandOptions } from "../../types/command-options";
import { CommandTypes } from "../../types/command-types";
import { BotClient } from "../bot-client";

/**
 * Abstract base class for all bot commands.
 *
 * This class provides the foundation for creating commands that can be executed
 * by the bot client. It defines the structure and common properties that all
 * commands must have, including metadata like name, description, usage examples,
 * and permission settings.
 *
 * @template T - The type of bot client that will execute this command, must extend BotClient
 *
 * @example
 * ```typescript
 * class PingCommand extends Command<MyBotClient> {
 *   constructor() {
 *     super({
 *       name: 'ping',
 *       description: 'Responds with pong',
 *       type: CommandTypes.Utility,
 *       usage: '<prefix>ping',
 *       examples: ['!ping']
 *     });
 *   }
 *
 *   async action(message: unknown, args?: unknown[]): Promise<unknown> {
 *     return 'Pong!';
 *   }
 * }
 * ```
 */
export abstract class Command<T extends BotClient> {
  /**
   * The name of the command, used by the dispatcher
   * to determine the command being executed.
   */
  name: string;

  /**
   * A brief description of the command, displayed
   * in the commands list via the Help command
   */
  description: string;

  /**
   * The command type that the command belongs to.
   */
  type: CommandTypes;

  /**
   * An example of command usage. The token `<prefix>` will
   * be replaced by the prefix defined in BotClient.
   */
  usage: string;

  /**
   * Examples of how the command should be used.
   */
  examples: string[];

  /**
   * Delimiter for command arguments.
   */
  argSeparator: string;

  /**
   * The file location of this command.
   */
  commandLocation: string;

  /**
   * Whether or not the command can be used only by the bot owner.
   */
  admin: boolean;

  /**
   * Whether or not the command can be used only by the room owner.
   */
  owner: boolean;

  /**
   * Aliases the command can be called by other than its name.
   */
  aliases: string[];

  /**
   * The bot client.
   */
  protected botClient: T;

  /**
   * @param options The command options.
   */
  constructor(options: CommandOptions) {
    this.name = options.name;
    this.description = options.description;
    this.type = options.type;
    this.usage = options.usage;
    this.examples = options.examples ?? [];
    this.argSeparator = options.argSeparator ?? ",";
    this.admin = options.admin ?? false;
    this.owner = options.owner ?? false;
    this.aliases = options.aliases ?? [];
  }

  /**
   * The method that will be executed when the command is called.
   *
   * @param message The message that triggered the command.
   * @param args The command arguments.
   * @returns The result of the command execution.
   */
  abstract action(message: unknown, args?: unknown[]): Promise<unknown>;

  /**
   * Register this as an available command.
   *
   * @param client The bot client to register command on.
   * @param commandLocation The path location of this command.
   */
  register(client: T, commandLocation: string): void {
    this.botClient = client;
    this.commandLocation = commandLocation;

    if (!this.name) {
      throw new Error(`Command must have a name.`);
    }

    if (!this.description) {
      throw new Error(`Command must have a description.`);
    }

    if (!this.type) {
      throw new Error(`Command must have a type.`);
    }

    if (!this.usage) {
      throw new Error(`Command must have a usage.`);
    }
  }
}
