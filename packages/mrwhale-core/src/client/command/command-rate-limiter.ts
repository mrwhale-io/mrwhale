import { CommandRateLimit } from "./command-rate-limit";

/**
 * Abstract base class for implementing command rate limiting functionality.
 * 
 * Provides a foundation for rate limiting commands by defining the basic structure
 * and parameters needed to control the frequency of command execution.
 * 
 * @abstract
 * @example
 * ```typescript
 * class MyRateLimiter extends CommandRateLimiter {
 *   get(id: string): CommandRateLimit {
 *     // Implementation specific logic
 *     return new CommandRateLimit();
 *   }
 * }
 * 
 * const limiter = new MyRateLimiter(5, 60000); // 5 requests per minute
 * ```
 */
export abstract class CommandRateLimiter {

  /**
   * The maximum number of command executions allowed within the rate limit time window.
   */
  readonly limit: number;

  /**
   * The duration of the rate limit time window in milliseconds.
   */
  readonly duration: number;

  /**
   * @param limit The maximum number of command executions allowed within the rate limit time window (default is 1).
   * @param duration The duration of the rate limit time window in milliseconds (default is 1000 ms).
   */
  constructor(limit?: number, duration?: number) {
    this.limit = limit ?? 1;
    this.duration = duration ?? 1000;
  }

  /**
   * Retrieves the CommandRateLimit instance associated with the given identifier.
   * 
   * @param id The identifier for which to retrieve the CommandRateLimit instance.
   * @returns A CommandRateLimit instance containing the current rate limit status for the given identifier.
   */
  abstract get(id: unknown): CommandRateLimit;
}
