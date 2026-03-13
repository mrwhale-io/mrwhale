import { Command, DEFAULT_COMMAND_RATE_LIMIT } from "@mrwhale-io/core";
import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltBotClient } from "../gamejolt-bot-client";

import { GameJoltCommandRateLimiter } from "./gamejolt-command-rate-limiter";
import { GameJoltCommandOptions } from "../../types/command-options";

/**
 * Abstract base class for Game Jolt bot commands.
 *
 * Extends the base Command class with Game Jolt-specific functionality including
 * rate limiting and group chat restrictions.
 *
 * @abstract
 * @extends Command<GameJoltBotClient>
 */
export abstract class GameJoltCommand extends Command<GameJoltBotClient> {
  /**
   * Whether or not the command can be used only in group chats.
   */
  groupOnly: boolean;

  /**
   * A rate limiter instance to manage command usage and prevent spam.
   * This rate limiter tracks command usage on a per-room and per-user basis,
   * allowing for fine-grained control over command access and cooldowns.
   */
  readonly rateLimiter: GameJoltCommandRateLimiter;

  /**
   * Creates a new GameJoltCommand instance.
   * @param options The options for this command, including cooldown duration and group-only restriction.
   */
  constructor(options: GameJoltCommandOptions) {
    super(options);
    this.rateLimiter = new GameJoltCommandRateLimiter(
      DEFAULT_COMMAND_RATE_LIMIT,
      options.cooldown,
    );
    this.groupOnly = options.groupOnly ?? false;
  }

  /**
   * The action this command performs.
   *
   * @param message The message that invoked this command.
   * @param [args] Any arguments passed with this command.
   */
  abstract action(message: Message, args?: unknown[]): Promise<unknown>;
}
