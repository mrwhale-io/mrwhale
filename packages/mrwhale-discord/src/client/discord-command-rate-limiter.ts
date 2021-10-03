import { CommandRateLimit, CommandRateLimiter } from "@mrwhale-io/core";
import { CommandInteraction } from "discord.js";

export class DiscordCommandRateLimiter implements CommandRateLimiter {
  readonly limit: number;
  readonly duration: number;

  private readonly rateLimits: Map<string, Map<string, CommandRateLimit>>;

  /**
   * @param limit The number of requests before rate limiting.
   * @param duration The duration the rate limit lasts.
   */
  constructor(limit: number, duration: number) {
    this.limit = limit;
    this.duration = duration;
    this.rateLimits = new Map<string, Map<string, CommandRateLimit>>();
  }

  /**
   * Get rate limit collections.
   *
   * @param interaction The command interaction to rate limit.
   */
  get(interaction: CommandInteraction): CommandRateLimit {
    if (!this.rateLimits.has(interaction.channelId)) {
      this.rateLimits.set(
        interaction.channelId,
        new Map<string, CommandRateLimit>()
      );
    }

    if (!this.rateLimits.get(interaction.channelId).has(interaction.user.id)) {
      this.rateLimits
        .get(interaction.channelId)
        .set(
          interaction.user.id,
          new CommandRateLimit(this.limit, this.duration)
        );
    }

    return this.rateLimits.get(interaction.channelId).get(interaction.user.id);
  }
}
