/**
 * A class to handle rate limiting for requests.
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
   * Throttles the requests based on the rate limit.
   * @returns A boolean indicating whether the request should be throttled.
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
