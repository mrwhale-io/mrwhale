import { Room, User } from "@mrwhale-io/gamejolt-client";
import { SubscriptionLimits } from "./subscription-limits";
import { SubscriptionTier } from "./subscription-tiers";

/**
 * Represents a user-created custom command with its configuration and content.
 */
export interface CustomCommand {
  /** Unique identifier for this custom command */
  id: string;

  /** Command name (what users type to trigger) */
  name: string;

  /** Description shown in help */
  description: string;

  /** Response content/template */
  content: string;

  /** Command aliases */
  aliases: string[];

  /** Cooldown in milliseconds */
  cooldown: number;

  /** Permission level */
  permissions: CustomCommandPermissions;

  /** When this command was created */
  createdAt: Date;

  /** When this command was last modified */
  updatedAt: Date;

  /** Who created this command */
  createdBy: number; // user ID

  /** Usage count for analytics */
  usageCount: number;

  /** Whether this command is currently active */
  enabled: boolean;

  /** Command behavior settings */
  behavior: CustomCommandBehavior;
}

/**
 * Permission settings for custom commands.
 */
export interface CustomCommandPermissions {
  /** Restrict to room owners only */
  ownerOnly: boolean;

  /** Restrict to group chats only */
  groupOnly: boolean;

  /** Restrict to specific users (user IDs) */
  allowedUsers: number[];

  /** Block specific users (user IDs) */
  blockedUsers: number[];
}

/**
 * Behavior configuration for custom commands.
 */
export interface CustomCommandBehavior {
  /** Response type */
  responseType: "text" | "embed" | "reaction";

  /** Whether to delete the trigger message */
  deleteTrigger: boolean;

  /** Whether to mention the user in response */
  mentionUser: boolean;

  /** Whether to use random responses (if multiple provided) */
  randomResponse: boolean;

  /** Auto-delete response after X seconds (0 = don't delete) */
  autoDelete: number;
}

/**
 * Template variables available in custom commands.
 */
export interface CustomCommandContext {
  /** User who triggered the command */
  user: Partial<User>;

  /** Room where the command was triggered */
  room: Partial<Room>;

  /** Command arguments */
  args: string[];

  /** Raw argument string */
  argsRaw: string;

  /** Timestamp when the command was triggered */
  timestamp: Date;
}

/**
 * Daily usage tracking for rate limiting.
 */
export interface CommandUsageTracker {
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Total usage count for the day */
  totalUsage: number;
  /** Usage count per command for the day */
  commandUsage: Map<string, number>; // command name -> usage count
}

/**
 * Represents the collection of custom commands for a room, along with subscription limits and usage tracking.
 */
export interface RoomCustomCommands {
  /**
   * Map of command name to CustomCommand object. This includes all commands for the room, regardless of enabled status.
   * The manager will handle filtering enabled commands when executing.
   */
  commands: Map<string, CustomCommand>;

  /**
   * Subscription limits for the room, which may affect how many commands can be created, cooldowns, etc.
   */
  limits: SubscriptionLimits;

  /**
   * Total usage count across all commands in this room (for analytics)
   */
  totalUsage: number;

  /**
   * Rate limiter instance for managing command cooldowns in this room. This is used internally by the manager to track cooldowns and usage.
   */
  dailyUsage: CommandUsageTracker;

  /**
   * When the commands were last updated (created/modified/deleted)
   */
  lastModified: Date;

  /** Subscription tier of the room (free, premium, pro) */
  subscriptionTier: SubscriptionTier;
}

/**
 * Stored format of custom commands data as it appears in persistent storage.
 * This represents the raw data before conversion to Maps and proper Date objects.
 */
export interface StoredCustomCommandsData {
  /** Commands stored as a plain object (key-value pairs) */
  commands: Record<string, CustomCommand>;
  
  /** Subscription limits for the room */
  limits: SubscriptionLimits;
  
  /** Total usage count across all commands */
  totalUsage: number;
  
  /** Daily usage tracking in storage format */
  dailyUsage: {
    /** Date in YYYY-MM-DD format */
    date: string;
    /** Total usage for the day */
    totalUsage: number;
    /** Command usage counts stored as plain object */
    commandUsage: Record<string, number>;
  };
  
  /** Last modified timestamp (can be Date or string/number) */
  lastModified: Date | string | number;
  
  /** Subscription tier */
  subscriptionTier: SubscriptionTier;
}
