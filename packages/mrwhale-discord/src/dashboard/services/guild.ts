import { APIGuild } from "discord.js";
import { request } from "undici";

import { Database, RankCardTheme } from "@mrwhale-io/core";
import { DISCORD_API_VERSION, DISCORD_URL } from "../../constants";
import { DiscordBotClient } from "../../client/discord-bot-client";
import { RankCard } from "../../database/models/rank-card";

/**
 * Makes a call to the discord api to fetch the current user's guilds.
 * @param tokenType The type of token.
 * @param accessToken The user's access token issued by the discord api.
 */
export async function getGuilds(
  tokenType: string,
  accessToken: string
): Promise<APIGuild[]> {
  const guildsResult = await request(
    `${DISCORD_URL}/api/${DISCORD_API_VERSION}/users/@me/guilds`,
    {
      headers: {
        authorization: `${tokenType} ${accessToken}`,
      },
    }
  );

  return (await guildsResult.body.json()) as APIGuild[];
}

/**
 * Sets a level channel for the given guild.
 * @param guildId The identifier of the guild to set level channel for.
 * @param channelId The identifier of the level channel.
 * @param botClient The bot client instance.
 */
export async function setLevelChannelForGuild(
  guildId: string,
  channelId: string,
  botClient: DiscordBotClient
) {
  const settings = botClient.guildSettings.get(guildId);
  if (settings) {
    settings.set("levelChannel", channelId);
  }
}

/**
 * Removes the level channel for the given guild.
 * @param guildId The identifier of the guild to remove level channel for.
 * @param botClient The bot client instance.
 */
export async function deleteLevelChannelForGuild(
  guildId: string,
  botClient: DiscordBotClient
) {
  const settings = botClient.guildSettings.get(guildId);
  if (settings) {
    settings.remove("levelChannel");
  }
}

/**
 * Toggle the levels on/off for the given guild.
 * @param guildId The identifier of the guild to toggle levels for.
 * @param botClient The bot client instance.
 */
export async function toggleLevelsForGuild(
  guildId: string,
  botClient: DiscordBotClient
) {
  let enabled = await isLevelsEnabled(guildId, botClient);
  enabled = !enabled;

  const settings = botClient.guildSettings.get(guildId);

  if (settings) {
    settings.set("levels", enabled);
  }

  return enabled;
}

/**
 * Set the prefix for the given guild.
 * @param prefix The prefix to set for the guild.
 * @param guildId he identifier of the guild to set ptefix for.
 * @param botClient The bot client instance.
 */
export async function setPrefixForGuild(
  prefix: string,
  guildId: string,
  botClient: DiscordBotClient
) {
  const settings = botClient.guildSettings.get(guildId);

  settings.set("prefix", prefix);
}

/**
 * Get all the settings for the given guild.
 * @param guildId The identifier of the guild.
 */
export async function getGuildSettings(guildId: string) {
  const settings = await Database.connection.model("guild_settings").findOne({
    where: {
      key: guildId,
    },
    attributes: ["value"],
  });

  return JSON.parse(settings["value"]);
}

async function isLevelsEnabled(guildId: string, botClient: DiscordBotClient) {
  if (!botClient.guildSettings.has(guildId)) {
    return false;
  }

  const settings = botClient.guildSettings.get(guildId);

  return await settings.get("levels", true);
}

/**
 * Gets the guild rank card theme settings from the database.
 * @param guildId The identifier of the guild.
 */
export async function getRankCardTheme(
  guildId: string
): Promise<RankCardTheme> {
  const rankCardTheme = await RankCard.findOne({
    where: {
      guildId,
    },
  });

  return { ...rankCardTheme, font: "sans-serif" };
}

/**
 * Updates or creates a rank card theme.
 * @param guildId The identifier of the guild.
 * @param card The card theme colours.
 */
export async function updateRankCard(
  guildId: string,
  cardTheme: RankCardTheme
) {
  RankCard.upsert({
    guildId,
    ...cardTheme,
  });
}
