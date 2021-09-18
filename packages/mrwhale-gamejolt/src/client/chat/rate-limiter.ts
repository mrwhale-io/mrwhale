export class RateLimiter {
  requestCount: number;
  timestamp: number;
  seconds: number;

  constructor(requestsNum: number, timestamp: number) {
    this.requestCount = requestsNum;
    this.timestamp = timestamp;
    this.seconds = 0;
  }

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
