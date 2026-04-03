import { BotOptions } from "@mrwhale-io/core";
import { StripeConfig } from "./stripe-config";

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

  /**
   * Stripe configuration for subscription management.
   * Optional - if not provided, subscription features will be disabled.
   */
  stripe?: StripeConfig;

  /**
   * Indicates whether the bot is running in development mode.
   * When enabled, certain features or behaviors may be altered for testing purposes.
   */
  development?: boolean;
}
