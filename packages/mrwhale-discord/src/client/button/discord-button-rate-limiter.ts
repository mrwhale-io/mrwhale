import { ButtonInteraction, Message } from "discord.js";

import { CommandRateLimit, CommandRateLimiter } from "@mrwhale-io/core";

export class DiscordButtonRateLimiter extends CommandRateLimiter {
  private readonly rateLimits: Map<string, Map<string, CommandRateLimit>>;

  constructor(limit?: number, duration?: number) {
    super(limit, duration);
    this.rateLimits = new Map<string, Map<string, CommandRateLimit>>();
  }

  /**
   * Get rate limit collections.
   * @param interaction The button interaction to rate limit.
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
