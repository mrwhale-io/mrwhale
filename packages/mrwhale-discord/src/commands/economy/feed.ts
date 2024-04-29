import {
  APIApplicationCommandOptionChoice,
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
  Message,
} from "discord.js";

import { FishTypeNames, fishTypes } from "@mrwhale-io/core";
import { DiscordCommand } from "../../client/command/discord-command";
import { EMBED_COLOR } from "../../constants";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "feed",
      description: "Feed Mr. Whale fish.",
      type: "economy",
      usage: "<prefix>feed",
      cooldown: 5000,
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
      const result = await this.botClient.feed(interaction, fishType, quantity);
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .addFields([
          {
            name: "Coins Rewarded",
            value: `🪙 ${result.reward}`,
          },
          {
            name: "Your Current Balance",
            value: `💰 ${result.newBalance}`,
          },
          {
            name: "Exp Gained",
            value: `💯 ${result.expGained}`,
          },
          {
            name: "Hunger Level",
            value: `${+result.hungerLevel.toFixed(2)}/100`,
          },
        ])
        .setColor(EMBED_COLOR)
        .setTitle("Thank you for feeding me, human.")
        .setDescription("Here is your reward.");

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      return interaction.reply(error.message);
    }
  }

  private getFishTypeOptions(): APIApplicationCommandOptionChoice<string>[] {
    return fishTypes.map((fishType) => ({
      name: fishType.name,
      value: fishType.name,
    }));
  }
}
