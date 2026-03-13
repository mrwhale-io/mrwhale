import { Message } from "@mrwhale-io/gamejolt-client";
import { CommandRateLimit, CommandRateLimiter } from "@mrwhale-io/core";

/**
 * A rate limiter for Game Jolt commands that tracks rate limits per room and user.
 * Extends the base CommandRateLimiter to provide room-specific and user-specific
 * rate limiting functionality.
 *
 * @extends CommandRateLimiter
 *
 * @example
 * ```typescript
 * const rateLimiter = new GameJoltCommandRateLimiter(5, 60000); // 5 commands per minute
 * const rateLimit = rateLimiter.get(message);
 * ```
 */
export class GameJoltCommandRateLimiter extends CommandRateLimiter {
  private readonly rateLimits: Map<number, Map<number, CommandRateLimit>>;

  /**
   * Creates a new GameJoltCommandRateLimiter instance.
   *
   * @param limit The maximum number of commands allowed within the duration before rate limiting occurs.
   * @param duration The duration (in milliseconds) for which the rate limit applies after the limit is exceeded.
   */
  constructor(limit: number, duration: number) {
    super(limit, duration);
    this.rateLimits = new Map<number, Map<number, CommandRateLimit>>();
  }

  /**
   * Retrieves the command rate limit for a specific user in a specific room.
   * If no rate limit exists for the room or user, creates new ones with the configured limit and duration.
   *
   * @param message - The message object containing room_id and user information
   * @returns The CommandRateLimit instance for the specified user in the specified room
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
