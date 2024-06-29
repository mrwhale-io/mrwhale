import {
  AutocompleteInteraction,
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
  Message,
  bold,
} from "discord.js";

import { BaseItem, ItemTypes } from "@mrwhale-io/core";
import { DiscordCommand } from "../../client/command/discord-command";
import { getShopItemsByType } from "../../util/shop-item-helpers";
import { EMBED_COLOR } from "../../constants";
import {
  equipUserItem,
  getUserItemByName,
} from "../../database/services/user-inventory";
import { extractUserAndGuildId } from "../../util/extract-user-and-guild-id";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "equip",
      description: "Equip an item from your inventory.",
      type: "economy",
      usage: "<prefix>equip [item]",
      guildOnly: true,
      cooldown: 3000,
    });
    this.slashCommandData
      .addStringOption((option) =>
        option
          .setName("item_type")
          .setDescription("The type of item to equip.")
          .setRequired(true)
          .addChoices(
            { name: "Fishing Rod", value: "FishingRod" },
            { name: "Bait", value: "Bait" }
          )
      )
      .addStringOption((option) =>
        option
          .setName("item_name")
          .setDescription("The name of the item to equip.")
          .setRequired(true)
          .setAutocomplete(true)
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
    const itemName = interaction.options.getString("item_name");

    return this.equipItem(itemName, interaction);
  }

  private async equipItem(
    itemName: string,
    interactionOrMessage: ChatInputCommandInteraction | Message
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    try {
      const { userId, guildId } = extractUserAndGuildId(interactionOrMessage);
      const userItem = await getUserItemByName(userId, guildId, itemName);
      if (!userItem) {
        return interactionOrMessage.reply("Item not found in your inventory.");
      }

      if (userItem.equipped) {
        return interactionOrMessage.reply("This item is already equipped.");
      }

      await equipUserItem(userId, guildId, userItem);

      // Send a confirmation message
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle("Item Equipped")
        .setDescription(`You have successfully equipped ${bold(itemName)}.`);

      return await interactionOrMessage.reply({ embeds: [embed] });
    } catch (error) {
      this.botClient.logger.error("Error equipping item:", error);
      return interactionOrMessage.reply(
        "An error occurred while trying to equip the item."
      );
    }
  }
}
