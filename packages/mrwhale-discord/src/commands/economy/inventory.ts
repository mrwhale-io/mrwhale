import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
  Message,
} from "discord.js";

import { code, fishTypes } from "@mrwhale-io/core";
import { DiscordCommand } from "../../client/command/discord-command";
import { EMBED_COLOR } from "../../constants";
import { getUserItemsFromInventory } from "../../database/services/inventory";
import { InventoryInstance } from "../../database/models/inventory";
import { getOrCreateUser } from "../../database/services/user";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "inventory",
      description: "Shows your inventory.",
      type: "economy",
      usage: "<prefix>inventory",
      cooldown: 3000,
    });
  }

  async action(
    message: Message
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    return this.showInventory(message);
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    return this.showInventory(interaction);
  }

  private async showInventory(
    interactionOrMessage: ChatInputCommandInteraction | Message
  ) {
    try {
      const userId = interactionOrMessage.member.user.id;
      const inventoryItems = await getUserItemsFromInventory(userId);
      const user = await getOrCreateUser(userId);
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle("Your inventory");

      embed.addFields([
        {
          name: "Fish",
          value: this.buildUserFishInventory(inventoryItems),
        },
        {
          name: "Your Current Balance",
          value: `💎 ${user.balance}`,
        },
      ]);

      return interactionOrMessage.reply({ embeds: [embed] });
    } catch (error) {
      this.botClient.logger.error("Error fetching inventory:", error);
      return interactionOrMessage.reply("Could not fetch your inventory.");
    }
  }

  private buildUserFishInventory(inventoryItems: InventoryInstance[]): string {
    const userFish = inventoryItems.filter((item) => item.itemType === "Fish");
    if (userFish.length === 0) {
      return "You have no fish in your inventory.";
    }

    return userFish
      .map((fish) => {
        const fishTypeInfo = fishTypes.find(
          (fishType) => fishType.name === fish.itemName
        );
        return `${code(`${fish.quantity}x`)} ${fishTypeInfo.icon} ${
          fish.itemName
        }`;
      })
      .join("\n");
  }
}
