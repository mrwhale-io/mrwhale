import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import { getEmbedWithPaginatorButtons } from "../../util/button/paginator-buttons";
import { getShopItemsEmbed } from "../../util/embed/shop-embed-helpers";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "shop",
      description: "Shop around for items.",
      type: "economy",
      usage: "<prefix>shop",
      cooldown: 3000,
    });
    this.slashCommandData.addStringOption((option) =>
      option
        .setName("category")
        .setDescription("The category of item to shop for.")
        .setRequired(true)
        .addChoices(
          { name: "Fishing Rods", value: "FishingRod" },
          { name: "Bait", value: "Bait" }
        )
    );
  }

  async action(message: Message) {}

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    try {
      const category = interaction.options.getString("category");
      return await this.getShopItemPages(interaction, category);
    } catch (error) {
      this.botClient.logger.error("Error fetching shop items:", error);
      return interaction.reply("Could not fetch shop items.");
    }
  }

  private async getShopItemPages(
    interaction: ChatInputCommandInteraction,
    itemType: string
  ) {
    const fetcShopItemEmbed = async (pageNumber: number) => {
      const { embed, pages } = await getShopItemsEmbed({
        itemType,
        guildId: interaction.guildId,
        discordUser: interaction.user,
        pageNumber,
        botClient: this.botClient,
      });

      return { embed, pages };
    };

    return await getEmbedWithPaginatorButtons(interaction, fetcShopItemEmbed);
  }
}
