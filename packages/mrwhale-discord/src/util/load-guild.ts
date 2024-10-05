import { Guild } from "discord.js";

import { DiscordBotClient } from "../client/discord-bot-client";

/**
 * Load a guild by ID.
 * @param botClient The Discord bot client.
 * @param guildId The guild ID to load.
 * @returns The loaded guild.
 */
export async function loadGuild(
  botClient: DiscordBotClient,
  guildId: string
): Promise<Guild> {
  let guild = botClient.client.guilds.cache.get(guildId);

  if (!guild) {
    try {
      // Fetch the guild from Discord in case it's not cached
      guild = await botClient.client.guilds.fetch(guildId);
    } catch (error) {
      throw `Error fetching guild with ID ${guildId}`;
    }
  }

  return guild;
}
