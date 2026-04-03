/**
 * Constants used across the bot, such as limits and tier configurations.
 */

import { SubscriptionLimits } from "./types/subscription-limits";

export const MAX_MESSAGE_LENGTH = 1000;

/**
 * Maximum length for command prefixes.
 * This is to prevent excessively long prefixes that could cause issues in parsing commands.
 */
export const MAX_PREFIX_LENGTH = 10;

/**
 * Limits for custom commands based on subscription tiers.
 * These limits define how many commands can be created, how many times they can be used daily,
 * how many aliases are allowed, and the maximum content length for command responses.
 */
export const TIER_LIMITS: { [key: string]: SubscriptionLimits } = {
  free: {
    maxCommands: 5,
    dailyUsage: 100,
    maxAliases: 2,
    maxContentLength: 500,
    canCreateCommands: false,
  },
  premium: {
    maxCommands: 25,
    dailyUsage: 500,
    maxAliases: 5,
    maxContentLength: 2000,
    canCreateCommands: true,
  },
  pro: {
    maxCommands: 100,
    dailyUsage: 2000,
    maxAliases: 20,
    maxContentLength: 5000,
    canCreateCommands: true,
  },
};
