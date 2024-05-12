import {
  APIApplicationCommandOptionChoice,
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
  Message,
} from "discord.js";

import {
  FED_MESSAGES,
  FishTypeNames,
  fishTypes,
  getFishByName,
} from "@mrwhale-io/core";
import { DiscordCommand } from "../../client/command/discord-command";
import { EMBED_COLOR } from "../../constants";
import { drawHealthBar } from "../../util/draw-health-bar";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "feed",
      description: "Feed Mr. Whale fish.",
      type: "economy",
      usage: "<prefix>feed",
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
    const guildId = interaction.guildId;

    try {
      const result = await this.botClient.feed(interaction, fishType, quantity);
      const currentMood = this.botClient.getCurrentMood(guildId);
      const fedMessage =
        FED_MESSAGES[currentMood][
          Math.floor(Math.random() * FED_MESSAGES[currentMood].length)
        ];
      const fish = getFishByName(fishType);
      const hungerLevel = this.botClient.getGuildHungerLevel(
        interaction.guildId
      );
      const currentProgress = Math.floor((hungerLevel / 100) * 100);
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .addFields([
          {
            name: "Gems Rewarded",
            value: `💎 +${result.reward}`,
          },
          {
            name: "Your Current Balance",
            value: `💰 ${result.newBalance}`,
          },
          {
            name: "Exp Gained",
            value: `🆙 +${result.expGained}`,
          },
          {
            name: "Satiety Level",
            value: `${drawHealthBar(result.hungerLevel)} ${currentProgress}%`,
          },
        ])
        .setTitle(`You just fed me ${quantity} ${fish.name} ${fish.icon} `)
        .setColor(EMBED_COLOR)
        .setDescription(`${fedMessage} \n\nHere is your reward:`);

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
