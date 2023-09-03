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
   * The base url of the dashboard api.
   */
  apiBaseUrl: string;

  /**
   * The client id of the OAuth2 discord client.
   */
  clientId: string;

  /**
   * The client secret of the OAuth2 discord client.
   */
  clientSecret: string;
}
