/**
 * Represents the options for the API client.
 */
export interface APIClientOptions {
  /**
   * The base URL for the site API.
   */
  base: string;

  /**
   * The frontend cookie.
   * This is used to identify the logged in user.
   */
  frontend: string;

  /**
   * The mrwhale token.
   * This is used to verify that this user is Mr. Whale.
   */
  mrwhaleToken: string;
}
