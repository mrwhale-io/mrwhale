/**
 * Custom error class for join user channel errors.
 */
export class JoinUserChannelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JoinUserChannelError";
  }
}
