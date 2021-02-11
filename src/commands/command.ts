import { Message } from "@mrwhale-io/gamejolt";

import { CommandOptions } from "../types/command-options";
import { BotClient } from "../bot-client";
import { CommandTypes } from "../types/command-types";
import { CommandRateLimiter } from "./command-rate-limiter";

/**
 * Command class to extend which users can execute.
 */
export abstract class Command {
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
   * Whether or not the command can be used only in group chats.
   */
  groupOnly: boolean;

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
  client: BotClient;

  /**
   * Command rate limiter.
   */
  readonly rateLimiter: CommandRateLimiter;

  /**
   * @param options The command options.
   */
  constructor(options: CommandOptions) {
    this.name = options.name;
    this.description = options.description;
    this.type = options.type;
    this.usage = options.usage;
    this.examples = options.examples || [];
    this.argSeparator = options.argSeparator || ",";
    this.groupOnly = options.groupOnly || false;
    this.admin = options.admin || false;
    this.owner = options.owner || false;
    this.aliases = options.aliases || [];
    this.rateLimiter = new CommandRateLimiter(1, options.cooldown || 1000);
  }

  /**
   * The action this command performs.
   * @param message The message that invoked this command.
   * @param [args] Any arguments passed with this command.
   */
  abstract action(message: Message, args?: unknown[]): Promise<unknown>;

  /**
   * Register this as an available command.
   * @param client The bot client to register command on.
   * @param commandLocation The path location of this command.
   */
  register(client: BotClient, commandLocation: string): void {
    this.client = client;
    this.commandLocation = commandLocation;

    if (!this.name) {
      throw new Error(`Command must have a name`);
    }

    if (!this.description) {
      throw new Error(`Command must have a description`);
    }

    if (!this.type) {
      throw new Error(`Command must have a type`);
    }

    if (!this.usage) {
      throw new Error(`Command must have a usage`);
    }

    this.client.commands.push(this);
  }
}
