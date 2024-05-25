import { Guild } from "discord.js";

/**
 * Get the active user's within the last hour.
 * @param guild The guild to fetch active users for.
 */
export async function getActiveUsers(guild: Guild): Promise<Set<string>> {
  const activeUsers = new Set<string>();
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const channels = guild.channels.cache.filter((channel) =>
    channel.isTextBased()
  );

  for (const channel of channels.values()) {
    if (channel.isTextBased()) {
      channel.messages.cache.forEach((message) => {
        const authorId = message.author.id;
        const interaction = message.interaction;

        if (
          message.createdTimestamp > oneHourAgo &&
          interaction &&
          interaction.user &&
          !activeUsers.has(interaction.user.id)
        ) {
          activeUsers.add(interaction.user.id);
        }

        if (
          message.createdTimestamp > oneHourAgo &&
          !activeUsers.has(authorId) &&
          !message.author.bot
        ) {
          activeUsers.add(authorId);
        }
      });
    }
  }

  return activeUsers;
}
