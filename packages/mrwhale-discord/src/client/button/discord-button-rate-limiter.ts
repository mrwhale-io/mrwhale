import { ButtonInteraction, Message } from "discord.js";

import { CommandRateLimit, CommandRateLimiter } from "@mrwhale-io/core";

/**
 * Represents a rate limiter for Discord button interactions.
 */
export class DiscordButtonRateLimiter extends CommandRateLimiter {
  private readonly rateLimits: Map<string, Map<string, CommandRateLimit>>;

  constructor(limit?: number, duration?: number) {
    super(limit, duration);
    this.rateLimits = new Map<string, Map<string, CommandRateLimit>>();
  }

  /**
   * Get the rate limit for a button interaction or message.
   * @param interaction The button interaction or message to rate limit.
   * @returns The rate limit for the interaction.
   */
  get(interaction: ButtonInteraction | Message): CommandRateLimit {
    if (!this.rateLimits.has(interaction.channelId)) {
      this.rateLimits.set(
        interaction.channelId,
        new Map<string, CommandRateLimit>()
      );
    }

    const userId =
      interaction instanceof ButtonInteraction
        ? interaction.user.id
        : interaction.author.id;

    if (!this.rateLimits.get(interaction.channelId).has(userId)) {
      this.rateLimits
        .get(interaction.channelId)
        .set(userId, new CommandRateLimit(this.limit, this.duration));
    }

    return this.rateLimits.get(interaction.channelId).get(userId);
  }
}
