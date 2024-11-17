import { EmbedBuilder } from "discord.js";

import {
  countFishByRarity,
  FISH_RARITY_ICONS,
  FishSpawnedResult,
} from "@mrwhale-io/core";
import { DiscordBotClient } from "../../client/discord-bot-client";
import { getFishSpawnAnnouncementMessage } from "../fish-announcements";
import { createEmbed } from "./create-embed";

const FISHING_TIPS = [
  "🎣 Using higher quality bait increases your chances of catching rare fish!",
  "🐟 Make sure to upgrade your fishing rod to catch bigger fish.",
  "🌊 Fishing during different times of the day can yield different fish.",
  "🪱 Use the /shop command to buy better equipment and increase your chances of catching rare fish.",
  "⚓ Keep an eye on your fishing attempts and make sure to restock your bait.",
  "🌞 Fishing during the day can yield different fish than fishing at night.",
  "🐋 You can earn gems and EXP by feeding fish to Mr. Whale.",
  "🏆 Check the /leaderboard to see who has caught the most fish in your server.",
  "🎣 Use /catch to start fishing. Good luck!",
  "🌊 Use the /ocean command to see the current fish in the ocean.",
  "🐟 Use the /inventory command to see your fishing equipment.",
];

export async function fishSpawnEmbed(
  guildId: string,
  fishSpawned: Record<string, FishSpawnedResult>,
  botClient: DiscordBotClient
): Promise<EmbedBuilder> {
  const fishCountsByRarity = countFishByRarity(fishSpawned);
  const currentMood = await botClient.getCurrentMood(guildId);
  const fishingTip = await getFishingTip(botClient);

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
    .addFields(
      {
        name: "Time Limit",
        value: `⏳ The fish will despawn <t:${nextDespawnTimeInSeconds}:R>`,
        inline: false,
      },
      {
        name: "Fishing Tip",
        value: fishingTip,
        inline: false,
      }
    )
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

export async function getFishingTip(
  botClient: DiscordBotClient
): Promise<string> {
  const appCommands =
    botClient.client.application.commands.cache.size > 0
      ? botClient.client.application.commands.cache
      : await botClient.client.application.commands.fetch();

  const fishingTipWithCommand = FISHING_TIPS.map((tip) => {
    const matchedCommand = tip.match(/\/(\w+)/);

    if (matchedCommand) {
      const extractedCommandName = matchedCommand[1];
      const commandId = appCommands.findKey(
        (cmd) => cmd.name === extractedCommandName
      );
      const replacedCommand = `</${extractedCommandName}:${commandId}>`;

      return tip.replace(`/${extractedCommandName}`, replacedCommand);
    }

    return tip;
  });

  return fishingTipWithCommand[
    Math.floor(Math.random() * fishingTipWithCommand.length)
  ];
}
