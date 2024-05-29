import { EmbedBuilder, Interaction, Message } from "discord.js";

import { Bait, Fish, FishingRod, NO_FISH_MESSAGES } from "@mrwhale-io/core";
import { DiscordBotClient } from "../../client/discord-bot-client";
import { EMBED_COLOR } from "../../constants";
import { getTwemojiUrl } from "../get-twemoji-url";

interface FishCaughtEmbedOptions {
  fishCaught: Fish;
  fishingRodUsed: FishingRod;
  baitUsed: Bait;
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
    baitUsed,
    fishingRodUsed,
    fishCaught,
  } = fishCaughtOptions;
  const userId = interaction.member.user.id;
  const guildId = interaction.guildId;
  const remainingFishingAttempts = botClient.getRemainingFishingAttempts(
    userId,
    guildId,
    fishingRodUsed
  );
  const attemptText =
    remainingFishingAttempts.attempts === 1 ? "cast" : "casts";
  embed.setFooter({
    text: `You have ${remainingFishingAttempts.attempts} ${attemptText} remaining.`,
  });

  if (!fishCaught) {
    const noFishMessage =
      NO_FISH_MESSAGES[Math.floor(Math.random() * NO_FISH_MESSAGES.length)];

    embed.setTitle(`Tough Luck!`).setDescription(noFishMessage);
    return embed;
  }

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
      { name: "Rarity", value: `🌟 ${fishCaught.rarity}`, inline: true }
    );

  return embed;
}
