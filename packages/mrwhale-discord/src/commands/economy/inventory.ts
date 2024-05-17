import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
  Message,
  User,
} from "discord.js";

import { code, getFishById, getFishingRodById } from "@mrwhale-io/core";
import { DiscordCommand } from "../../client/command/discord-command";
import { EMBED_COLOR } from "../../constants";
import { getUserItemsFromInventory } from "../../database/services/user-inventory";
import { UserInventoryInstance } from "../../database/models/user-inventory";

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
    return this.showInventory(message.author, message);
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    return this.showInventory(interaction.user, interaction);
  }

  private async showInventory(
    discordUser: User,
    interactionOrMessage: ChatInputCommandInteraction | Message
  ) {
    try {
      const userId = interactionOrMessage.member.user.id;
      const user = this.botClient.users.get(userId);
      const inventoryItems = await getUserItemsFromInventory(userId);
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setAuthor({
          name: "Your Inventory",
          iconURL: discordUser.avatarURL(),
        })
        .setDescription("Here is a list of all the items you have collected.");

      embed.addFields([
        {
          name: "🐟 Fish",
          value: this.buildUserFishInventory(inventoryItems),
        },
        {
          name: "🎣 Fishing Rods",
          value: this.buildUserFishingRodInventory(inventoryItems),
        },
      ]);

      embed.setFooter({ text: `💎 Your Balance: ${user.balance}` });

      return interactionOrMessage.reply({ embeds: [embed] });
    } catch (error) {
      this.botClient.logger.error("Error fetching inventory:", error);
      return interactionOrMessage.reply("Could not fetch your inventory.");
    }
  }

  private buildUserFishInventory(
    inventoryItems: UserInventoryInstance[]
  ): string {
    const filteredFishItems = inventoryItems.filter(
      (item) => item.itemType === "Fish"
    );
    if (filteredFishItems.length === 0) {
      return "You have no fish in your inventory.";
    }

    return filteredFishItems
      .map((item) => {
        const fish = getFishById(item.itemId);
        return `${code(`${item.quantity}x`)} ${fish.icon} ${fish.name}`;
      })
      .join("\n");
  }

  private buildUserFishingRodInventory(
    inventoryItems: UserInventoryInstance[]
  ): string {
    const filteredFishItems = inventoryItems.filter(
      (item) => item.itemType === "FishingRod"
    );

    if (filteredFishItems.length === 0) {
      return "You have no fishing rods in your inventory.";
    }

    return filteredFishItems
      .map((item) => {
        const isEquipped = item.equipped;
        const fishingRod = getFishingRodById(item.itemId);
        return `${code(`${item.quantity}x`)} ${fishingRod.name} ${
          isEquipped ? " " + code("[Equipped]") : ""
        }`;
      })
      .join("\n");
  }
}
