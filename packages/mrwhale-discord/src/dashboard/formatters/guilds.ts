import { ChannelType, Guild } from "discord.js";

/**
 * Returns a formatted guild used for api responses.
 * @param guild The guild to format.
 */
export function getFormattedGuild(guild: Guild) {
  const channels = guild.channels.cache
    .filter((channel) => channel.type === ChannelType.GuildText)
    .map((channel) => ({
      id: channel.id,
      name: channel.name,
    }));

  return {
    id: guild.id,
    name: guild.name,
    icon: guild.icon,
    channels,
  };
}
