import { ChannelType, Guild, GuildBasedChannel } from "discord.js";

/**
 * Retrieves the first text channel in the guild where the bot has permission to send messages and attach files.
 *
 * This function iterates through the cached channels of the given guild and finds the first channel that:
 * - Is of type 'GuildText'
 * - The bot has permission to send messages and attach files in
 *
 * @param guild The guild to search for a suitable text channel.
 * @returns The first text channel in the guild where the bot can send messages and attach files.
 */
export function getFirstTextChannel(guild: Guild): GuildBasedChannel {
  const channels = guild.channels.cache;
  return channels.find(
    (c) =>
      c.type === ChannelType.GuildText &&
      c.permissionsFor(guild.members.me).has(["SendMessages", "AttachFiles"])
  );
}
