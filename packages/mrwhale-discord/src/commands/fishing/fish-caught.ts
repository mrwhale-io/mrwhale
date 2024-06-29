import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
  Message,
  User,
} from "discord.js";

import { FISH_RARITY_ICONS } from "@mrwhale-io/core";
import { DiscordCommand } from "../../client/command/discord-command";
import { EMBED_COLOR } from "../../constants";
import { getFishCaughtByRarity } from "../../database/services/fish-caught";
import { extractUserAndGuildId } from "../../util/extract-user-and-guild-id";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "fishcaught",
      description: "Shows the total number of fish caught.",
      type: "fishing",
      usage: "<prefix>fishcaught",
      guildOnly: true,
      cooldown: 3000,
    });
  }

  async action(
    message: Message
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    return this.showFishCaught(message.author, message);
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    return this.showFishCaught(interaction.user, interaction);
  }

  private async showFishCaught(
    discordUser: User,
    interactionOrMessage: ChatInputCommandInteraction | Message
  ) {
    try {
      const { userId, guildId } = extractUserAndGuildId(interactionOrMessage);
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setAuthor({
          name: "Fish Caught",
          iconURL: discordUser.avatarURL(),
        })
        .setDescription("Here is a breakdown of the fish you have caught:")
        .setTimestamp();

      const fishCaught = await getFishCaughtByRarity(userId, guildId);
      const sortOrder = Object.keys(FISH_RARITY_ICONS);
      const raritiesInOrder = Object.keys(fishCaught).sort(
        (a, b) => sortOrder.indexOf(a) - sortOrder.indexOf(b)
      );

      for (const rarity of raritiesInOrder) {
        if (rarity !== "total") {
          const icon = FISH_RARITY_ICONS[rarity];
          const count = fishCaught[rarity];
          embed.addFields({
            name: `${icon} ${rarity}`,
            value: `${count} fish`,
            inline: true,
          });
        }
      }

      embed.addFields({
        name: "🎣 Total Fish Caught",
        value: `${fishCaught.total} fish`,
        inline: false,
      });

      return interactionOrMessage.reply({ embeds: [embed] });
    } catch (error) {
      this.botClient.logger.error("Error fetching fish caught:", error);
      return interactionOrMessage.reply("Could not fetch fish caught stats.");
    }
  }
}
