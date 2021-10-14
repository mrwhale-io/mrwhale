import { BotOptions } from "@mrwhale-io/core";

/**
 * Contains options to be passed to a BotClient object on construction.
 */
export interface GameJoltBotOptions extends BotOptions {
  /**
   * API token for cleverbot.
   */
  cleverbotToken?: string;

  /**
   * The game api private key.
   */
  privateKey: string;

  /**
   * The game id.
   */
  gameId: number;
}
