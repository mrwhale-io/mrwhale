import { EmbedBuilder } from "discord.js";

import {
  countFishByRarity,
  FISH_RARITY_ICONS,
  FishSpawnedResult,
} from "@mrwhale-io/core";
import { DiscordBotClient } from "../../client/discord-bot-client";
import { getFishSpawnAnnouncementMessage } from "../fish-announcements";
import { createEmbed } from "./create-embed";

export async function fishSpawnEmbed(
  guildId: string,
  fishSpawned: Record<string, FishSpawnedResult>,
  botClient: DiscordBotClient
): Promise<EmbedBuilder> {
  const fishCountsByRarity = countFishByRarity(fishSpawned);
  const currentMood = await botClient.getCurrentMood(guildId);

  const announementMessageText = getFishSpawnAnnouncementMessage(
    currentMood,
    fishSpawned
  );
  const activityScheduler = botClient.activitySchedulerManager.getScheduler(
    guildId
  );
  const activity = activityScheduler.getCurrentRunningActivity(guildId);
  const nextDespawnTimeInSeconds = Math.floor(activity.endTime / 1000);
  const spawnAnnouncement = createEmbed(announementMessageText)
    .setTitle("Fish Spawn")
    .addFields({
      name: "Time Limit",
      value: `⏳ The fish will despawn <t:${nextDespawnTimeInSeconds}:R>`,
      inline: false,
    })
    .setFooter({
      text: "Use /catch to start fishing. Happy fishing!",
    })
    .setTimestamp();

  Object.entries(fishCountsByRarity)
    .filter(([_, value]) => value >= 1)
    .forEach(([key, value]) => {
      spawnAnnouncement.addFields({
        name: `${FISH_RARITY_ICONS[key]} ${key} Fish`,
        value: `${value}`,
        inline: true,
      });
    });

  return spawnAnnouncement;
}
