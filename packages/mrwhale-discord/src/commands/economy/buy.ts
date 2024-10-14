import {
  AutocompleteInteraction,
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
  Message,
  bold,
} from "discord.js";
import * as pluralize from "pluralize";

import {
  Bait,
  BaseItem,
  FishingRod,
  ItemTypes,
  getLevelFromExp,
} from "@mrwhale-io/core";
import { DiscordCommand } from "../../client/command/discord-command";
import {
  getBaitsAvailable,
  getFishingRodsAvailable,
  getShopItemsByType,
} from "../../util/shop-item-helpers";
import { EMBED_COLOR } from "../../constants";
import { updateOrCreateUserItem } from "../../database/services/user-inventory";
import { getFishingRodsOwnedByPlayer } from "../../database/services/fishing-rods";
import { LevelManager } from "../../client/managers/level-manager";
import { extractUserAndGuildId } from "../../util/extract-user-and-guild-id";
import { pascalCaseToWords } from "../../util/pascal-case-to-words";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "buy",
      description: "Buy an item from the shop.",
      type: "economy",
      usage: "<prefix>buy",
      guildOnly: true,
      cooldown: 3000,
    });
    this.slashCommandData
      .addStringOption((option) =>
        option
          .setName("item_type")
          .setDescription("The type of item to buy.")
          .setRequired(true)
          .addChoices(
            { name: "Fishing Rod", value: "FishingRod" },
            { name: "Bait", value: "Bait" }
          )
      )
      .addStringOption((option) =>
        option
          .setName("item_name")
          .setDescription("The name of the item to buy.")
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addIntegerOption((option) =>
        option
          .setName("quantity")
          .setDescription("The number of items to buy.")
          .setMinValue(1)
          .setRequired(false)
      );
  }

  async action(message: Message) {}

  async autocomplete(
    interaction: AutocompleteInteraction<CacheType>
  ): Promise<void> {
    const focusedOption = interaction.options.getFocused(true);
    const itemType = interaction.options.getString("item_type") as ItemTypes;

    if (focusedOption.name === "item_name" && itemType) {
      const items = getShopItemsByType(itemType);
      const choices = items.map((item: BaseItem) => item.name);
      const filteredChoices = choices.filter((choice) =>
        choice.toLowerCase().startsWith(focusedOption.value.toLowerCase())
      );
      await interaction.respond(
        filteredChoices.map((choice) => ({ name: choice, value: choice }))
      );
    }
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    const itemType = interaction.options.getString("item_type") as ItemTypes;
    const itemName = interaction.options.getString("item_name");
    const quantity = interaction.options.getInteger("quantity") || 1;

    return this.buyItem(itemType, itemName, quantity, interaction);
  }

  private async buyItem(
    itemType: ItemTypes,
    itemName: string,
    quantity: number,
    interactionOrMessage: ChatInputCommandInteraction | Message
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    try {
      const { userId, guildId } = extractUserAndGuildId(interactionOrMessage);
      const userBalance = await this.botClient.getUserBalance(userId, guildId);

      const item = this.findShopItem(itemType, itemName);
      if (!item) {
        return interactionOrMessage.reply("Item not found in the shop.");
      }

      const hasUnlockedItem = await this.userHasUnlockedItem(
        itemType,
        itemName,
        userId,
        guildId
      );

      if (await this.userAlreadyOwnsItem(itemType, itemName, userId, guildId)) {
        return interactionOrMessage.reply(
          `You already own this${pascalCaseToWords(itemType)}.`
        );
      }

      if (!hasUnlockedItem) {
        return interactionOrMessage.reply(
          `You have not unlocked this${pascalCaseToWords(itemType)}.`
        );
      }

      if (itemType === "FishingRod" && quantity > 1) {
        return interactionOrMessage.reply(
          `You can only own one of each${pascalCaseToWords(itemType)}.`
        );
      }

      const itemCost = item.cost * quantity;
      if (userBalance < itemCost) {
        return interactionOrMessage.reply(
          `You do not have enough gems to buy ${
            quantity > 1 ? "these items." : "this item."
          }`
        );
      }

      await this.processPurchase(
        interactionOrMessage,
        item,
        itemType,
        quantity
      );

      const newBalance = userBalance - itemCost;
      const embed = this.createPurchaseSuccessEmbed(
        item.name,
        itemCost,
        newBalance,
        quantity
      );

      return interactionOrMessage.reply({ embeds: [embed] });
    } catch (error) {
      this.botClient.logger.error("Error processing purchase:", error);
      return interactionOrMessage.reply(
        "An error occurred while processing your purchase."
      );
    }
  }

  private async userHasUnlockedItem(
    itemType: ItemTypes,
    itemName: string,
    userId: string,
    guildId: string
  ): Promise<boolean> {
    const userScore = await LevelManager.getUserScore(guildId, userId);
    const userLevel = getLevelFromExp(userScore.exp);

    switch (itemType) {
      case "FishingRod":
        const { availableFishingRods } = await getFishingRodsAvailable(
          userLevel
        );
        return availableFishingRods.some(
          (fishingRod) => fishingRod.name === itemName
        );

      case "Bait":
        const { availableBaits } = await getBaitsAvailable(userLevel);
        return availableBaits.some((bait) => bait.name === itemName);
    }

    return false;
  }

  private async userAlreadyOwnsItem(
    itemType: ItemTypes,
    itemName: string,
    userId: string,
    guildId: string
  ): Promise<boolean> {
    if (itemType === "FishingRod") {
      const ownedFishingRods = await getFishingRodsOwnedByPlayer(
        userId,
        guildId
      );
      return ownedFishingRods.some(
        (fishingRod) => fishingRod.name === itemName
      );
    }

    return false;
  }

  private async processPurchase(
    interactionOrMessage: ChatInputCommandInteraction | Message,
    item: FishingRod | Bait,
    itemType: ItemTypes,
    quantity: number
  ) {
    const { userId, guildId } = extractUserAndGuildId(interactionOrMessage);
    const itemCost = item.cost * quantity;
    await this.botClient.addToUserBalance(
      guildId,
      userId,
      -itemCost
    );
    await updateOrCreateUserItem({
      userId,
      guildId,
      itemId: item.id,
      itemType,
      quantity,
    });
  }

  private createPurchaseSuccessEmbed(
    itemName: string,
    itemCost: number,
    newBalance: number,
    quantity: number
  ): EmbedBuilder {
    const quantitytext = quantity > 1 ? bold(`${quantity}`) : "";
    const itemText = quantity > 1 ? pluralize(itemName) : itemName;

    return new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle("Purchase Successful")
      .setDescription(
        `You have successfully bought ${quantitytext} ${bold(
          itemText
        )} for ${itemCost} gems.`
      )
      .setFooter({ text: `💎 Your new balance: ${newBalance}` });
  }

  private findShopItem(
    itemType: ItemTypes,
    itemName: string
  ): FishingRod | Bait | null {
    const items = getShopItemsByType(itemType);
    return (
      items.find(
        (item) => item.name.toLowerCase() === itemName.toLowerCase()
      ) || null
    );
  }
}
