import { EmbedBuilder, Interaction, Message, bold } from "discord.js";

import { Fish, NO_FISH_MESSAGES } from "@mrwhale-io/core";
import { EMBED_COLOR } from "../constants";
import { DiscordBotClient } from "../client/discord-bot-client";

/**
 * Returns an embed containing all the fish that are currently in the guild.
 */
export async function getOceanEmbed(
  interaction: Interaction | Message,
  botClient: DiscordBotClient
): Promise<EmbedBuilder> {
  const guildId = interaction.guildId;
  const fish = botClient.getGuildFish(guildId);
  const embed = new EmbedBuilder().setColor(EMBED_COLOR);

  if (!fish || Object.keys(fish).length === 0) {
    return embed.setDescription("The ocean is currently devoid of any life.");
  }

  let totalFish = 0;
  let description = "Here's what's lurking beneath the waves: \n\n";
  for (const [key, value] of Object.entries(fish)) {
    totalFish += value.quantity;
    description += `${value.icon} ${key}: ${value.quantity}\n`;
  }

  embed.setTitle(`The Ocean`);
  embed.setDescription(description);

  return embed;
}

export async function getCaughtFishEmbed(
  fishCaught: Fish
): Promise<EmbedBuilder> {
  const embed = new EmbedBuilder().setColor(EMBED_COLOR);

  if (!fishCaught) {
    const noFishMessage =
      NO_FISH_MESSAGES[Math.floor(Math.random() * NO_FISH_MESSAGES.length)];

    embed.setTitle("Tough Luck!").setDescription(noFishMessage);
    return embed;
  }

  embed
    .setTitle("Congratulations!")
    .setDescription(
      `You caught a ${fishCaught.icon} ${bold(fishCaught.name)}!`
    );

  return embed;
}
