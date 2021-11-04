import { Command, DEFAULT_COMMAND_RATE_LIMIT } from "@mrwhale-io/core";
import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltBotClient } from "../gamejolt-bot-client";

import { GameJoltCommandRateLimiter } from "./gamejolt-command-rate-limiter";
import { GameJoltCommandOptions } from "../../types/command-options";

export abstract class GameJoltCommand extends Command<GameJoltBotClient> {
  /**
   * Whether or not the command can be used only in group chats.
   */
  groupOnly: boolean;

  /**
   * The command rate limiter.
   */
  readonly rateLimiter: GameJoltCommandRateLimiter;

  constructor(options: GameJoltCommandOptions) {
    super(options);
    this.rateLimiter = new GameJoltCommandRateLimiter(
      DEFAULT_COMMAND_RATE_LIMIT,
      options.cooldown
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
