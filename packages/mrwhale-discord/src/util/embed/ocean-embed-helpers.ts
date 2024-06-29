import { EmbedBuilder, Interaction, Message } from "discord.js";

import { DiscordBotClient } from "../../client/discord-bot-client";
import { EMBED_COLOR } from "../../constants";

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

  if (!botClient.hasGuildFish(guildId)) {
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
