import { DiscordBotClient } from "../client/discord-bot-client";
import { getActiveUsers } from "./get-active-users";
import { loadGuild } from "./load-guild";

/**
 * Retrieves the active users in a guild.
 * @param guildId The ID of the guild.
 * @param botClient The Discord bot client.
 */
export async function getActiveUserIds(
  guildId: string,
  botClient: DiscordBotClient
): Promise<string[]> {
  const guild = await loadGuild(botClient, guildId);
  const activeUsers = await getActiveUsers(guild);

  return Array.from(activeUsers);
}
