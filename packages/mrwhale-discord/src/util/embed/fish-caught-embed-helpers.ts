import { EmbedBuilder, Interaction, Message } from "discord.js";

import {
  Achievement,
  Bait,
  Fish,
  FishingRod,
  NO_FISH_MESSAGES,
} from "@mrwhale-io/core";
import { DiscordBotClient } from "../../client/discord-bot-client";
import { EMBED_COLOR } from "../../constants";
import { getTwemojiUrl } from "../get-twemoji-url";
import { formatAchievements } from "../format-achievements";

interface FishCaughtEmbedOptions {
  fishCaught: Fish;
  fishingRodUsed: FishingRod;
  baitUsed: Bait;
  achievements: Achievement[];
  interaction: Interaction | Message;
  botClient: DiscordBotClient;
}

/**
 * Returns an embed containing all the fish caught by catch command.
 */
export async function getCaughtFishEmbed(
  fishCaughtOptions: FishCaughtEmbedOptions
): Promise<EmbedBuilder> {
  const embed = new EmbedBuilder().setColor(EMBED_COLOR);
  const {
    interaction,
    botClient,
    fishingRodUsed,
    fishCaught,
  } = fishCaughtOptions;

  setFooterText(embed, botClient, interaction, fishingRodUsed);

  if (!fishCaught) {
    setNoFishCaughtEmbed(embed);
    return embed;
  }

  setFishCaughtEmbedFields(embed, fishCaughtOptions);
  return embed;
}

function setFooterText(
  embed: EmbedBuilder,
  botClient: DiscordBotClient,
  interaction: Interaction | Message,
  fishingRodUsed: FishingRod
): void {
  const userId = interaction.member.user.id;
  const guildId = interaction.guildId;
  const remainingFishingAttempts = botClient.fishingAttemptTracker.getRemainingAttempts(
    userId,
    guildId,
    fishingRodUsed
  );
  const attemptText =
    remainingFishingAttempts.attempts === 1 ? "cast" : "casts";
  embed.setFooter({
    text: `You have ${remainingFishingAttempts.attempts} ${attemptText} remaining.`,
  });
}

function setNoFishCaughtEmbed(embed: EmbedBuilder): void {
  const noFishMessage =
    NO_FISH_MESSAGES[Math.floor(Math.random() * NO_FISH_MESSAGES.length)];
  embed.setTitle(`Tough Luck!`).setDescription(noFishMessage);
}

function setFishCaughtEmbedFields(
  embed: EmbedBuilder,
  fishCaughtOptions: FishCaughtEmbedOptions
): void {
  const {
    achievements,
    interaction,
    baitUsed,
    fishingRodUsed,
    fishCaught,
  } = fishCaughtOptions;

  embed
    .setTitle(`${fishCaught.icon} ${fishCaught.name} Caught!`)
    .setDescription(
      `<@${interaction.member.user.id}> has caught a ${fishCaught.name}.`
    )
    .setThumbnail(getTwemojiUrl(fishCaught.icon))
    .addFields(
      { name: "About", value: fishCaught.description, inline: false },
      { name: "Worth", value: `💎 ${fishCaught.worth} gems`, inline: true },
      {
        name: "EXP Worth",
        value: `⭐ ${fishCaught.expWorth} EXP`,
        inline: true,
      },
      { name: "HP Worth", value: `❤️ ${fishCaught.hpWorth} HP`, inline: true },
      {
        name: "Fishing Rod Used",
        value: `🎣 ${fishingRodUsed.name}`,
        inline: true,
      },
      {
        name: "Fishing Bait Used",
        value: `${baitUsed.icon} ${baitUsed.name}`,
        inline: true,
      },
      { name: "Rarity", value: `🌟 ${fishCaught.rarity}`, inline: true },
      {
        name: "Achievements Unlocked",
        value: formatAchievements(achievements),
        inline: true,
      }
    );
}
