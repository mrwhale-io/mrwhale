/**
 * Contains options to be passed to a BotClient object on construction.
 */
export interface BotOptions {
  /**
   * Prefix denoting a command call.
   */
  prefix: string;

  /**
   * The user identifier of the bot owner.
   */
  ownerId: number | string;
}
