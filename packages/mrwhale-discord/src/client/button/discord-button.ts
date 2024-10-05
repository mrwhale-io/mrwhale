import { ButtonBuilder, ButtonInteraction } from "discord.js";

import { DEFAULT_COMMAND_RATE_LIMIT } from "@mrwhale-io/core";
import { DiscordButtonOptions } from "../../types/button/discord-button-options";
import { DiscordButtonRateLimiter } from "./discord-button-rate-limiter";
import { Loadable } from "../../types/loadable";

/**
 * Represents an abstract class for a Discord button.
 */
export abstract class DiscordButton extends Loadable {
  /**
   * The rate limiter for the button.
   */
  readonly rateLimiter: DiscordButtonRateLimiter;

  /**
   * Creates a new instance of the DiscordButton class.
   * @param options The options for the Discord button.
   */
  constructor(options: DiscordButtonOptions) {
    super(options.name);
    this.rateLimiter = new DiscordButtonRateLimiter(
      DEFAULT_COMMAND_RATE_LIMIT,
      options.cooldown
    );
  }

  /**
   * The action to be run when a button is clicked.
   * @param interaction The interaction that invoked the button.
   * @returns A promise that resolves when the action is completed.
   */
  abstract action(interaction: ButtonInteraction): Promise<unknown>;

  /**
   * Get an instance of the button builder.
   * @param userId The identifier of the discord user that requested the button.
   * @returns An instance of the button builder.
   */
  getButtonBuilder?(userId: string): ButtonBuilder;
}
