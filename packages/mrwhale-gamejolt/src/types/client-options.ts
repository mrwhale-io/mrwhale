/**
 * Contains properties to be passed to a Client on construction.
 */
export interface ClientOptions {
  /**
   * The identifier of the client user.
   */
  userId: number;

  /**
   * The base url of the chat server.
   */
  baseChatUrl?: string;

  /**
   * The base url of the site api.
   */
  baseApiUrl?: string;

  /**
   * The base url of the grid server.
   */
  baseGridUrl?: string;

  /**
   * The max number of requests that can be made
   * before rate limiting.
   */
  rateLimitRequests?: number;

  /**
   * The max duration of rate limiting.
   */
  rateLimitDuration?: number;

  /**
   * The identifier of the session.
   */
  frontend: string;
}
