/**
 * Defines the limits for each subscription tier.
 * These limits include the maximum number of commands, daily uses, aliases, content length, and whether commands can be created.
 */
export interface SubscriptionLimits {
  /** Maximum number of custom commands allowed in a room */
  maxCommands: number;
  /** Maximum number of times custom commands can be used daily */
  dailyUsage: number;
  /** Maximum number of aliases allowed per command */
  maxAliases: number;
  /** Maximum length of command content in characters */
  maxContentLength: number;
  /** Whether users of this tier can create custom commands */
  canCreateCommands: boolean;
}
