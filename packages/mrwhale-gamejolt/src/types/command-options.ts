import { CommandOptions } from "@mrwhale-io/core";

/**
 * Contains properties to be passed to a Command on construction.
 */
export interface GameJoltCommandOptions extends CommandOptions {
  /**
   * Whether or not the command can be used only in group chats.
   */
  groupOnly?: boolean;
}
