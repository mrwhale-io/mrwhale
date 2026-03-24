import { CommandOptions } from "@mrwhale-io/core";

/**
 * Contains properties to be passed to a Command on construction.
 */
export interface GameJoltCommandOptions extends CommandOptions {
  /**
   * Whether or not the command can be used only in group chats.
   */
  groupOnly?: boolean;

  /**
   * Whether or not this command is premium-only.
   * Premium commands are only available to users who have supported the bot.
   */
  premium?: boolean;

  /**
   * Whether or not this command requires any premium subscription.
   * Used for usage tracking and access control.
   * If not specified, defaults to the value of 'premium'.
   */
  requiresPremium?: boolean;

  /**
   * The specific premium tier required to use this command.
   * - 'premium': Requires Premium subscription ($4.99/month)
   * - 'pro': Requires Pro subscription ($9.99/month)
   * - undefined: No specific tier required (free command)
   */
  premiumTier?: 'premium' | 'pro';
}
