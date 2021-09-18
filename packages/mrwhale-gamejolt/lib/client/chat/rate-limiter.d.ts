export declare class RateLimiter {
    requestCount: number;
    timestamp: number;
    seconds: number;
    constructor(requestsNum: number, timestamp: number);
    throttle(): boolean;
}
