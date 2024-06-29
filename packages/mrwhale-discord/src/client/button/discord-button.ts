import { ButtonBuilder, ButtonInteraction } from "discord.js";

import { DEFAULT_COMMAND_RATE_LIMIT } from "@mrwhale-io/core";
import { DiscordBotClient } from "../discord-bot-client";
import { DiscordButtonOptions } from "../../types/button/discord-button-options";
import { DiscordButtonRateLimiter } from "./discord-button-rate-limiter";

export abstract class DiscordButton {
  /**
   * The name of the discord button
   */
  name: string;

  /**
   * Command rate limiter.
   */
  readonly rateLimiter: DiscordButtonRateLimiter;

  /**
   * An instance of the current discord bot client.
   */
  protected botClient: DiscordBotClient;

  constructor(options: DiscordButtonOptions) {
    this.name = options.name;
    this.rateLimiter = new DiscordButtonRateLimiter(
      DEFAULT_COMMAND_RATE_LIMIT,
      options.cooldown
    );
  }

  /**
   * The action to be run when a button is clicked.
   * @param interaction The interaction that invoked the button.
   */
  abstract action(interaction: ButtonInteraction): Promise<unknown>;

  /**
   * Registers a new instance of this menu.
   * @param client The bot instance.
   */
  register(client: DiscordBotClient): void {
    this.botClient = client;
    if (!this.name) {
      throw new Error(`Button must have a name.`);
    }
  }

  /**
   * Get an instance of the button builder.
   * @param userId The identifier of the discord user that requested the button.
   */
  getButtonBuilder?(userId: string): ButtonBuilder;
}
