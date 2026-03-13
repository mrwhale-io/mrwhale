
/**
 * A rate limiter implementation that uses a token bucket algorithm to throttle requests.
 * 
 * This class manages request throttling by distributing allowed requests evenly across
 * a specified time window. When the throttle method is called, it determines whether
 * the current request should be allowed or blocked based on the configured rate limits.
 * 
 * @example
 * ```typescript
 * // Allow 5 requests per 60 seconds
 * const rateLimiter = new RateLimiter(5, 60);
 * 
 * if (rateLimiter.throttle()) {
 *   console.log("Request blocked - rate limit exceeded");
 * } else {
 *   console.log("Request allowed");
 * }
 * ```
 */
export class RateLimiter {
  /**
   * The number of requests allowed.
   */
  requestCount: number;

  /**
   * The timestamp for the rate limit window in seconds.
   */
  timestamp: number;

  /**
   * The current time in seconds.
   */
  seconds: number;

  constructor(requestsNum: number, timestamp: number) {
    this.requestCount = requestsNum;
    this.timestamp = timestamp;
    this.seconds = 0;
  }

  /**
   * Throttles requests based on a rate limiting algorithm.
   * 
   * This method implements a token bucket-like rate limiting mechanism that calculates
   * the next available time slot for a request based on the configured timestamp and
   * request count parameters.
   * 
   * @returns `true` if the request should be throttled (rate limit exceeded), 
   *          `false` if the request can proceed
   */
  throttle(): boolean {
    let sn = this.seconds;
    const now = ~~(Date.now() / 1000);

    if (!sn) {
      sn = now + this.timestamp / this.requestCount;
    } else {
      sn += this.timestamp / this.requestCount;
    }
    if (sn < now) {
      sn = now + this.timestamp / this.requestCount;
    } else if (sn > now + this.timestamp) {
      return true;
    }
    this.seconds = sn;

    return false;
  }
}
