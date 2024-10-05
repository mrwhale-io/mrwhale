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

  /**
   * The discord bot list API key.
   */
  discordBotList?: string;

  /**
   * The url of the discord OAuth2 redirect.
   */
  redirectUrl: string;

  /**
   * The url of the dashboard.
   */
  proxyUrl: string;

  /**
   * The client id of the OAuth2 discord client.
   */
  clientId: string;

  /**
   * The client secret of the OAuth2 discord client.
   */
  clientSecret: string;

  /**
   * The directory of the discord menus.
   */
  selectMenuDir: string;

  /**
   * The directory of the discord buttons.
   */
  buttonsDir: string;

  /**
   * The directory of the bot activities.
   */
  activitiesDir: string;
}
