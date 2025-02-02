/**
 * Contains properties to be passed to a GridManager on construction.
 */
export interface GridManagerOptions {
  /**
   * The base url of the grid server.
   */
  baseUrl?: string;

  /**
   * The session identifier to auth with.
   */
  frontend: string;

  /**
   * The token that let's Game Jolt know that the client is Mr. Whale.
   */
  mrwhaleToken: string;
}
