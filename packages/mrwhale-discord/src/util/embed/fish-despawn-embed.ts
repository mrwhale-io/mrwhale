import { EmbedBuilder } from "discord.js";

import { createEmbed } from "./create-embed";
import { DiscordBotClient } from "../../client/discord-bot-client";
import {
  getAllFishCaughtAnnouncementMessage,
  getFishDespawnAnnouncementMessage,
} from "../fish-announcements";

export async function fishDespawnEmbed(
  guildId: string,
  botClient: DiscordBotClient
): Promise<EmbedBuilder> {
  const guildFish = botClient.fishSpawner.getGuildFish(guildId);
  const currentMood = await botClient.getCurrentMood(guildId);
  const hasGuildFish = botClient.fishSpawner.hasGuildFish(guildId);

  // Generate the announcement message text based on the current mood and spawned fish
  const announementMessage = !hasGuildFish
    ? getAllFishCaughtAnnouncementMessage(currentMood)
    : getFishDespawnAnnouncementMessage(currentMood, guildFish);
  const title = !hasGuildFish ? "All Fish Caught" : "Fish Despawn";

  const announcementEmbed = createEmbed(announementMessage)
    .setTitle(title)
    .setTimestamp();

  return announcementEmbed;
}
