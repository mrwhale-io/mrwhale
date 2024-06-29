import { SelectMenuType } from "discord.js";

/**
 * Contains properties to be passed to a discord select menu on construction.
 */
export interface DiscordSelectMenuOptions {
  /**
   * The name of this select menu.
   */
  name: string;

  /**
   * The type of select menu.
   */
  type?: SelectMenuType;
}
