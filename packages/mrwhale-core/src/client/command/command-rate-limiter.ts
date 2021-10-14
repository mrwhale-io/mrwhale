import { CommandRateLimit } from "./command-rate-limit";

export abstract class CommandRateLimiter {
  /**
   * The maximum number of requests allowed.
   */
  readonly limit: number;

  /**
   * The duration of the rate limit.
   */
  readonly duration: number;

  /**
   * @param [limit] The maximum number of requests allowed.
   * @param [duration] The duration of the rate limit.
   */
  constructor(limit?: number, duration?: number) {
    this.limit = limit ?? 1;
    this.duration = duration ?? 1000;
  }

  /**
   * Get command rate limit object.
   *
   * @param id The id of the rate limit object.
   */
  abstract get(id: unknown): CommandRateLimit;
}
