import {
  APIApplicationCommandOptionChoice,
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from "discord.js";

import { FishTypeNames, fishTypes, getFishByName } from "@mrwhale-io/core";
import { DiscordCommand } from "../../client/command/discord-command";
import { getUserFishByType } from "../../util/fishing";
import { UserFish } from "../../database/models/user-fish";

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
  ): Promise<InteractionResponse<boolean>> {
    const fishType = interaction.options.getString("fish") as FishTypeNames;
    const quantity = interaction.options.getInteger("quantity");
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const usersFish = await getUserFishByType(userId, fishType);

    if (!usersFish || usersFish.quantity <= 0) {
      return interaction.reply(`You have no ${fishType} in your inventory.`);
    }

    if (quantity > usersFish.quantity) {
      return interaction.reply(
        `You only have ${usersFish.quantity} ${fishType} in your inventory.`
      );
    }
    usersFish.quantity -= quantity;

    if (usersFish.quantity <= 0) {
      UserFish.destroy({
        where: {
          userId,
          fishName: usersFish.fishName,
        },
      });
    }

    usersFish.save();

    const fishToFeed = getFishByName(usersFish.fishName);
    this.botClient.feed(guildId, fishToFeed, quantity);

    const hungerLevel = this.botClient.getGuildHungerLevel(interaction.guildId);

    return interaction.reply(
      `My hunger level is now ${+hungerLevel.toFixed(2)}`
    );
  }

  private getFishTypeOptions(): APIApplicationCommandOptionChoice<string>[] {
    return fishTypes.map((fishType) => ({
      name: fishType.name,
      value: fishType.name,
    }));
  }
}
