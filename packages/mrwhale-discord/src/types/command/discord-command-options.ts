import { CommandOptions } from "@mrwhale-io/core";
import { PermissionResolvable } from "discord.js";

/**
 * Contains properties to be passed to a discord Command on construction.
 */
export interface DiscordCommandOptions extends CommandOptions {
  /**
   * Whether this is for guilds only.
   */
  guildOnly?: boolean;

  /**
   * Permissions required by the command caller.
   */
  callerPermissions?: PermissionResolvable[];

  /**
   * Permissions required by the client.
   */
  clientPermissions?: PermissionResolvable[];
}
