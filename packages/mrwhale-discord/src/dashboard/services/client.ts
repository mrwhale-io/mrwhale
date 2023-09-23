import { DiscordBotClient } from "../../client/discord-bot-client";

/**
 * Get the total number of guild members.
 * @param botClient The bot client.
 */
export function getTotalMemberCount(botClient: DiscordBotClient): number {
  const guilds = botClient.client.guilds.cache;
  return guilds.reduce(
    (totalMembers, guild) => totalMembers + guild.memberCount,
    0
  );
}
