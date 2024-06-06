import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
  Message,
  User,
} from "discord.js";

import {
  code,
  getAchievementById,
  getBaitById,
  getFishById,
  getFishingRodById,
} from "@mrwhale-io/core";
import { DiscordCommand } from "../../client/command/discord-command";
import { EMBED_COLOR } from "../../constants";
import { getUserItemsFromInventory } from "../../database/services/user-inventory";
import { UserInventoryInstance } from "../../database/models/user-inventory";
import { addFishingRodToUserInventory } from "../../database/services/fishing-rods";
import { getUserAchievements } from "../../database/services/achievements";
import { formatAchievements } from "../../util/format-achievements";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "inventory",
      description: "Shows your inventory.",
      type: "economy",
      usage: "<prefix>inventory",
      guildOnly: true,
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
      const { userId, guildId } = this.getUserAndGuildId(interactionOrMessage);
      const userBalance = await this.botClient.getUserBalance(userId, guildId);
      const inventoryItems = await getUserItemsFromInventory(userId, guildId);

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setAuthor({
          name: "Your Inventory",
          iconURL: discordUser.avatarURL(),
        })
        .setDescription("Here is a list of all the items you have collected.");

      const fishItems = this.buildUserFishInventory(inventoryItems);
      const fishingRodItems = await this.buildUserFishingRodInventory(
        inventoryItems,
        userId,
        guildId
      );
      const baitItems = this.buildUserBaitInventory(inventoryItems);
      const achievements = await this.buildUserAchievements(userId, guildId);

      embed.addFields([
        { name: "🐟 Fish", value: fishItems },
        { name: "🎣 Fishing Rods", value: fishingRodItems },
        { name: "🪱 Bait", value: baitItems },
        {
          name: "🎯 Achievements",
          value: achievements,
        },
      ]);

      embed.setFooter({ text: `💎 Your Balance: ${userBalance}` });

      return interactionOrMessage.reply({ embeds: [embed] });
    } catch (error) {
      this.botClient.logger.error("Error fetching inventory:", error);
      return interactionOrMessage.reply("Could not fetch your inventory.");
    }
  }

  private getUserAndGuildId(
    interactionOrMessage: ChatInputCommandInteraction | Message
  ) {
    const userId = interactionOrMessage.member.user.id;
    const guildId = interactionOrMessage.guildId;
    return { userId, guildId };
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

  private async buildUserFishingRodInventory(
    inventoryItems: UserInventoryInstance[],
    userId: string,
    guildId: string
  ): Promise<string> {
    const fishingRods = inventoryItems.filter(
      (item) => item.itemType === "FishingRod"
    );

    if (fishingRods.length === 0) {
      const basicFishingRod = await addFishingRodToUserInventory(
        userId,
        guildId,
        "Basic Fishing Rod",
        true
      );
      fishingRods.push(basicFishingRod);
    }

    return fishingRods
      .map((item) => {
        const isEquipped = item.equipped;
        const fishingRod = getFishingRodById(item.itemId);
        return `${code(`${item.quantity}x`)} ${fishingRod.name} ${
          isEquipped ? " " + code("[Equipped]") : ""
        }`;
      })
      .join("\n");
  }

  private buildUserBaitInventory(
    inventoryItems: UserInventoryInstance[]
  ): string {
    const filteredBaitItems = inventoryItems.filter(
      (item) => item.itemType === "Bait"
    );
    if (filteredBaitItems.length === 0) {
      return "You have no bait in your inventory.";
    }

    return filteredBaitItems
      .map((item) => {
        const isEquipped = item.equipped;
        const bait = getBaitById(item.itemId);
        return `${code(`${item.quantity}x`)} ${bait.icon} ${bait.name} ${
          isEquipped ? " " + code("[Equipped]") : ""
        }`;
      })
      .join("\n");
  }

  private async buildUserAchievements(
    userId: string,
    guildId: string
  ): Promise<string> {
    const userAchievements = await getUserAchievements(userId, guildId);
    const achievements = userAchievements.map((ua) =>
      getAchievementById(ua.achievementId)
    );

    return formatAchievements(achievements);
  }
}
