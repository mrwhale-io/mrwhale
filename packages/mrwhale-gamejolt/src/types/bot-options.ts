/**
 * Contains options to be passed to a BotClient object on construction.
 */
export interface BotOptions {
  /**
   * Prefix denoting a command call.
   */
  prefix: string;

  /**
   * API token for cleverbot.
   */
  cleverbotToken?: string;

  /**
   * The user identifier of the bot owner.
   */
  ownerId: number;

  /**
   * The game api private key.
   */
  privateKey: string;

  /**
   * The game id.
   */
  gameId: number;
}
