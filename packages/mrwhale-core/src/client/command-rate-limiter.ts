import { CommandRateLimit } from "./command-rate-limit";

export interface CommandRateLimiter {
  readonly limit: number;
  readonly duration: number;

  /**
   * Get command rate limit object.
   *
   * @param message The message to rate limit.
   */
  get(message: unknown): CommandRateLimit;
}
