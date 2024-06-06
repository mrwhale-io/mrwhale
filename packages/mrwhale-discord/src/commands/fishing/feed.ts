import {
  APIApplicationCommandOptionChoice,
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from "discord.js";

import { FishTypeNames, fishTypes } from "@mrwhale-io/core";
import { DiscordCommand } from "../../client/command/discord-command";

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
        .setRequired(true)
        .addChoices(...this.getFishTypeOptions())
    );
    this.slashCommandData.addIntegerOption((option) =>
      option
        .setName("quantity")
        .setDescription("The number of fish to feed Mr. Whale.")
        .setMinValue(1)
        .setRequired(true)
    );
  }

  async action(message: Message, [text]: [string]): Promise<void> {}

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    const fishType = interaction.options.getString("fish") as FishTypeNames;
    const quantity = interaction.options.getInteger("quantity");

    try {
      const embed = await this.botClient.feed(interaction, fishType, quantity);

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      this.botClient.logger.error("Error feeding fish:", error);
      return interaction.reply("An error occured while feeding fish.");
    }
  }

  private getFishTypeOptions(): APIApplicationCommandOptionChoice<string>[] {
    return fishTypes.map((fishType) => ({
      name: fishType.name,
      value: fishType.name,
    }));
  }
}
