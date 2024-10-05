import {
  Client,
  DMChannel,
  GuildTextBasedChannel,
  PartialDMChannel,
  TextBasedChannel,
} from "discord.js";

/**
 * Load a channel by ID.
 * @param client The Discord client.
 * @param channelId The channel ID to load.
 * @param defaultChannel The default channel to return if the channel is not found.
 * @returns The loaded channel.
 */
export async function loadChannel(
  client: Client,
  channelId: string,
  defaultChannel: DMChannel | PartialDMChannel | GuildTextBasedChannel
): Promise<TextBasedChannel> {
  try {
    const channel = client.channels.cache.has(channelId)
      ? (client.channels.cache.get(channelId) as TextBasedChannel)
      : ((await client.channels.fetch(channelId)) as TextBasedChannel);

    return channel;
  } catch {
    return defaultChannel;
  }
}
