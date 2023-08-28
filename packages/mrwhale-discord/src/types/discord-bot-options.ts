import { BotOptions } from "@mrwhale-io/core";

/**
 * Contains properties to be passed to a discord bot on construction.
 */
export interface DiscordBotOptions extends BotOptions {
  /**
   * The version of the discord bot.
   */
  version: string;

  /**
   * The support server for the discord bot.
   */
  discordServer: string;
}
