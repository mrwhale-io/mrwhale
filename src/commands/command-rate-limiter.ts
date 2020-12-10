import { Message } from "@mrwhale-io/gamejolt";

import { CommandRateLimit } from "./command-rate-limit";

/**
 * Handle ratelimiter objects for chatrooms.
 */
export class CommandRateLimiter {
  private readonly rateLimits: Map<number, Map<number, CommandRateLimit>>;
  private limit: number;
  private duration: number;

  /**
   * @param limit The number of requests before rate limiting.
   * @param duration The duration the rate limit lasts.
   */
  constructor(limit: number, duration: number) {
    this.limit = limit;
    this.duration = duration;
    this.rateLimits = new Map<number, Map<number, CommandRateLimit>>();
  }

  /**
   * Get rate limit collections.
   * @param message The message to rate limit.
   */
  get(message: Message): CommandRateLimit {
    if (!this.rateLimits.has(message.room_id)) {
      this.rateLimits.set(message.room_id, new Map<number, CommandRateLimit>());
    }

    if (!this.rateLimits.get(message.room_id).has(message.user.id)) {
      this.rateLimits
        .get(message.room_id)
        .set(message.user.id, new CommandRateLimit(this.limit, this.duration));
    }

    return this.rateLimits.get(message.room_id).get(message.user.id);
  }
}
