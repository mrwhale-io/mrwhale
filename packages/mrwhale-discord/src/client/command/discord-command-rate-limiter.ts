import { CommandRateLimit, CommandRateLimiter } from "@mrwhale-io/core";
import { ChatInputCommandInteraction, Message } from "discord.js";

export class DiscordCommandRateLimiter extends CommandRateLimiter {
  readonly limit: number;
  readonly duration: number;

  private readonly rateLimits: Map<string, Map<string, CommandRateLimit>>;

  constructor(limit?: number, duration?: number) {
    super(limit, duration);
    this.rateLimits = new Map<string, Map<string, CommandRateLimit>>();
  }

  /**
   * Get rate limit collections.
   *
   * @param interaction The command interaction to rate limit.
   */
  get(interaction: ChatInputCommandInteraction | Message): CommandRateLimit {
    if (!this.rateLimits.has(interaction.channelId)) {
      this.rateLimits.set(
        interaction.channelId,
        new Map<string, CommandRateLimit>()
      );
    }

    const userId =
      interaction instanceof ChatInputCommandInteraction
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
