/**
 * Command Rate limiter.
 */
export class CommandRateLimit {
  /**
   * The time the ratelimit expires.
   */
  expires: number;

  /**
   * Gets whether the command is rate limited.
   */
  get isRateLimited(): boolean {
    return this.count >= this.limit && Date.now() < this.expires;
  }

  /**
   * Gets the notified status.
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
   * Call the ratelimiter.
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
   * Set notified status.
   */
  setNotified(): void {
    this.notified = true;
  }

  private reset(): void {
    this.count = 0;
    this.expires = 0;
    this.notified = false;
  }
}
