/**
 * A rate limiter for commands that tracks usage count and enforces limits over a specified duration.
 *
 * The rate limiter allows a certain number of calls within a time window. Once the limit is reached,
 * subsequent calls are blocked until the time window expires and the limiter resets.
 *
 * @example
 * ```typescript
 * // Allow 5 calls per 60 seconds
 * const rateLimiter = new CommandRateLimit(5, 60000);
 *
 * if (rateLimiter.call()) {
 *   // Command can be executed
 *   console.log('Command executed');
 * } else {
 *   // Rate limit exceeded
 *   if (!rateLimiter.wasNotified) {
 *     console.log('Rate limit exceeded');
 *     rateLimiter.setNotified();
 *   }
 * }
 * ```
 */
export class CommandRateLimit {
  /**
   * The timestamp when the current rate limit expires. This is set when the first call is made and resets after the duration has passed.
   */
  expires: number;

  /**
   * Checks if the rate limit has been exceeded. 
   * This returns true if the number of calls has reached the limit and the current time is still before the expiration time.
   * @returns `true` if the rate limit is currently active, `false` otherwise.
   * @remarks This does not check if the user has been notified about the rate limit; it only checks if the limit has been exceeded.
   */
  get isRateLimited(): boolean {
    return this.count >= this.limit && Date.now() < this.expires;
  }

  /**
   * Checks if the user has been notified about the rate limit.
   * This is typically used to ensure that the user is only notified once when they hit the rate limit.
   * @returns `true` if the user has been notified about the rate limit, `false` otherwise.
   */
  get wasNotified(): boolean {
    return this.notified;
  }

  private readonly limit: number;
  private readonly duration: number;
  private count: number;
  private notified: boolean;

  /**
   * @param limit The number of requests before rate limiting.
   * @param duration The duration the rate limit lasts.
   */
  constructor(limit: number, duration: number) {
    this.limit = limit;
    this.duration = duration;
    this.reset();
  }

  /**
   * Attempts to consume a rate limit token.
   * 
   * This method checks if the rate limit window has expired and resets it if necessary.
   * If the current count is below the limit, it increments the count and returns true.
   * If this is the first call in the window, it sets the expiration time.
   * 
   * @returns `true` if the call is allowed (within rate limit), `false` if rate limited
   */
  call(): boolean {
    if (this.expires < Date.now()) {
      this.reset();
    }

    if (this.count >= this.limit) {
      return false;
    }

    this.count++;
    if (this.count === 1) {
      this.expires = Date.now() + this.duration;
    }

    return true;
  }

  /**
   * Marks the user as having been notified about the rate limit.
   * This is typically used to prevent multiple notifications for the same rate limit event.
   */
  setNotified(): void {
    this.notified = true;
  }

  /**
   * Resets the rate limiter to its initial state. This clears the count, resets the expiration time, and clears the notification flag.
   * This is called automatically when the rate limit window expires, but can also be called manually if needed.
   */
  private reset(): void {
    this.count = 0;
    this.expires = 0;
    this.notified = false;
  }
}
