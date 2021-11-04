/**
 * Contains options to be passed to a BotClient object on construction.
 */
export interface BotOptions {
  /**
   * The commands directory.
   */
  commandsDir: string;

  /**
   * Prefix denoting a command call.
   */
  prefix: string;

  /**
   * The user identifier of the bot owner.
   */
  ownerId: number | string;
}
