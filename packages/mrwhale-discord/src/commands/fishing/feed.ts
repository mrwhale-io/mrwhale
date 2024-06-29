import {
  APIApplicationCommandOptionChoice,
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
  Message,
} from "discord.js";

import { FishTypeNames, fishTypes } from "@mrwhale-io/core";
import { DiscordCommand } from "../../client/command/discord-command";
import { InventoryError } from "../../types/errors/inventory-error";
import { createEmbed } from "../../util/embed/create-embed";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "feed",
      description: "Feed Mr. Whale fish.",
      type: "fishing",
      usage: "<prefix>feed",
      guildOnly: true,
      cooldown: 3000,
    });
    this.slashCommandData.addStringOption((option) =>
      option
        .setName("fish")
        .setDescription("Choose a fish to feed Mr. Whale.")
        .setRequired(false)
        .addChoices(...this.getFishTypeOptions())
    );
    this.slashCommandData.addIntegerOption((option) =>
      option
        .setName("quantity")
        .setDescription("The number of fish to feed Mr. Whale.")
        .setMinValue(1)
        .setRequired(false)
    );
    this.slashCommandData.addBooleanOption((option) =>
      option
        .setName("all")
        .setDescription("Feed all fish in your inventory to Mr. Whale.")
        .setRequired(false)
    );
  }

  async action(message: Message, [text]: [string]): Promise<void> {}

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    const fishType = interaction.options.getString("fish") as FishTypeNames;
    const quantity = interaction.options.getInteger("quantity");
    const feedAll = interaction.options.getBoolean("all");

    try {
      let embed: EmbedBuilder;

      if (feedAll) {
        embed = await this.botClient.feedAll(interaction);
      } else {
        if (!fishType || !quantity) {
          return interaction.reply({
            content:
              "You must specify both fish type and quantity or choose to feed all.",
            ephemeral: true,
          });
        }
        embed = await this.botClient.feed(interaction, fishType, quantity);
      }

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      if (error instanceof InventoryError) {
        const inventoryError = createEmbed(error.message);
        return interaction.reply({ embeds: [inventoryError] });
      } else {
        this.botClient.logger.error("Error feeding fish:", error);
        return interaction.reply("An error occured while feeding fish.");
      }
    }
  }

  private getFishTypeOptions(): APIApplicationCommandOptionChoice<string>[] {
    return fishTypes.map((fishType) => ({
      name: fishType.name,
      value: fishType.name,
    }));
  }
}
