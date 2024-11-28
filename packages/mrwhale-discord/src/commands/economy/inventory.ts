import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
  Message,
  User,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  InteractionCollector,
  StringSelectMenuInteraction,
  CacheType,
  UserSelectMenuInteraction,
  RoleSelectMenuInteraction,
  MentionableSelectMenuInteraction,
  ChannelSelectMenuInteraction,
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
import {
  equipUserItem,
  getUserItemById,
  getUserItemsFromInventory,
} from "../../database/services/user-inventory";
import { UserInventoryInstance } from "../../database/models/user-inventory";
import { addFishingRodToUserInventory } from "../../database/services/fishing-rods";
import { getUserAchievements } from "../../database/services/achievements";
import { formatAchievements } from "../../util/format-achievements";
import { extractUserAndGuildId } from "../../util/extract-user-and-guild-id";

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
      const { userId, guildId } = extractUserAndGuildId(interactionOrMessage);
      let inventoryItems = await getUserItemsFromInventory(userId, guildId);
      const userBalance = await this.botClient.getUserBalance(userId, guildId);

      const embed = this.createInventoryEmbed(
        discordUser,
        userBalance,
        inventoryItems
      );

      const mainRow = this.createMainButtonRow();

      const message = await interactionOrMessage.reply({
        allowedMentions: { repliedUser: false },
        embeds: [embed],
        components: [mainRow],
      });

      const filter = (i: ButtonInteraction) =>
        ["fish", "fishingRods", "bait", "achievements"].includes(i.customId) ||
        (i.customId.startsWith("equip_") && i.user.id === discordUser.id);
      const collector = message.createMessageComponentCollector({
        filter,
        time: 60000, // 1 minute to interact with the buttons
      });

      collector.on("collect", async (i) => {
        collector.resetTimer(); // Reset the collector's timeout

        inventoryItems = await getUserItemsFromInventory(userId, guildId);
        await this.handleButtonInteraction(
          i,
          inventoryItems,
          userId,
          guildId,
          embed,
          mainRow,
          collector
        );
      });

      collector.on("end", () => {
        message.edit({ components: [] }).catch((error) => {
          this.botClient.logger.error("Error editing message:", error);
        });
      });
    } catch (error) {
      this.botClient.logger.error("Error fetching inventory:", error);
      return interactionOrMessage.reply("Could not fetch your inventory.");
    }
  }

  private createInventoryEmbed(
    discordUser: User,
    userBalance: number,
    inventoryItems: UserInventoryInstance[]
  ): EmbedBuilder {
    const fishItems = this.buildUserFishInventory(inventoryItems);
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setAuthor({
        name: "Your Inventory",
        iconURL: discordUser.avatarURL(),
      })
      .setDescription(
        `Hello <@${discordUser.id}>! Here is a detailed list of all the items you have collected in your inventory. Use the buttons below to navigate through different categories and manage your items.`
      )
      .setFooter({ text: `💎 Your Balance: ${userBalance}` })
      .addFields([{ name: "🐟 Fish", value: fishItems }]);
    return embed;
  }

  private createMainButtonRow(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("fish")
        .setLabel("Fish")
        .setEmoji("🐟")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("fishingRods")
        .setLabel("Fishing Rods")
        .setEmoji("🎣")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("bait")
        .setEmoji("🪱")
        .setLabel("Bait")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("achievements")
        .setEmoji("🎯")
        .setLabel("Achievements")
        .setStyle(ButtonStyle.Primary)
    );
  }

  private async handleButtonInteraction(
    interaction:
      | StringSelectMenuInteraction<CacheType>
      | UserSelectMenuInteraction<CacheType>
      | RoleSelectMenuInteraction<CacheType>
      | MentionableSelectMenuInteraction
      | ChannelSelectMenuInteraction
      | ButtonInteraction,
    inventoryItems: UserInventoryInstance[],
    userId: string,
    guildId: string,
    embed: EmbedBuilder,
    mainRow: ActionRowBuilder<ButtonBuilder>,
    collector: InteractionCollector<
      | StringSelectMenuInteraction<CacheType>
      | UserSelectMenuInteraction<CacheType>
      | RoleSelectMenuInteraction<CacheType>
      | MentionableSelectMenuInteraction
      | ChannelSelectMenuInteraction
      | ButtonInteraction
    >
  ) {
    if (interaction.customId === "fish") {
      embed.spliceFields(0, 1, {
        name: "🐟 Fish",
        value: this.buildUserFishInventory(inventoryItems),
      });
      await interaction.update({
        allowedMentions: { repliedUser: false },
        embeds: [embed],
        components: [mainRow],
      });
    } else if (interaction.customId === "fishingRods") {
      embed.spliceFields(0, 1, {
        name: "🎣 Fishing Rods",
        value: await this.buildUserFishingRodInventory(
          inventoryItems,
          userId,
          guildId
        ),
      });
      await interaction.update({
        allowedMentions: { repliedUser: false },
        embeds: [embed],
        components: [mainRow],
      });
      await this.addEquipButtons(
        interaction,
        inventoryItems,
        "FishingRod",
        userId,
        guildId,
        embed,
        mainRow,
        collector
      );
    } else if (interaction.customId === "bait") {
      embed.spliceFields(0, 1, {
        name: "🪱 Bait",
        value: this.buildUserBaitInventory(inventoryItems),
      });
      await interaction.update({
        allowedMentions: { repliedUser: false },
        embeds: [embed],
        components: [mainRow],
      });
      await this.addEquipButtons(
        interaction,
        inventoryItems,
        "Bait",
        userId,
        guildId,
        embed,
        mainRow,
        collector
      );
    } else if (interaction.customId === "achievements") {
      const achievements = await this.buildUserAchievements(userId, guildId);
      embed.spliceFields(0, 1, {
        name: "🎯 Achievements",
        value: achievements,
      });
      await interaction.update({
        allowedMentions: { repliedUser: false },
        embeds: [embed],
        components: [mainRow],
      });
    }
  }

  private async addEquipButtons(
    interaction:
      | StringSelectMenuInteraction<CacheType>
      | UserSelectMenuInteraction<CacheType>
      | RoleSelectMenuInteraction<CacheType>
      | MentionableSelectMenuInteraction
      | ChannelSelectMenuInteraction
      | ButtonInteraction,
    inventoryItems: UserInventoryInstance[],
    itemType: "FishingRod" | "Bait",
    userId: string,
    guildId: string,
    embed: EmbedBuilder,
    mainRow: ActionRowBuilder<ButtonBuilder>,
    collector: InteractionCollector<
      | StringSelectMenuInteraction<CacheType>
      | UserSelectMenuInteraction<CacheType>
      | RoleSelectMenuInteraction<CacheType>
      | MentionableSelectMenuInteraction
      | ChannelSelectMenuInteraction
      | ButtonInteraction
    >
  ) {
    const filteredItems = inventoryItems.filter(
      (item) => item.itemType === itemType
    );

    const equipRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      filteredItems.map((item) =>
        new ButtonBuilder()
          .setCustomId(`equip_${itemType}_${item.itemId}`)
          .setDisabled(item.equipped)
          .setEmoji(
            itemType === "FishingRod"
              ? getFishingRodById(item.itemId).icon
              : getBaitById(item.itemId).icon
          )
          .setLabel(
            `Equip ${
              itemType === "FishingRod"
                ? getFishingRodById(item.itemId).name
                : getBaitById(item.itemId).name
            }`
          )
          .setStyle(ButtonStyle.Success)
      )
    );

    try {
      await interaction.editReply({ components: [mainRow, equipRow] });
    } catch (error) {
      this.botClient.logger.error("Error editing reply:", error);
      return;
    }

    const equipFilter = (i: ButtonInteraction) =>
      i.customId.startsWith("equip_") && i.user.id === userId;
    const equipCollector = interaction.message.createMessageComponentCollector({
      filter: equipFilter,
      time: 60000, // 1 minute to interact with the equip buttons
    });

    equipCollector.on("collect", async (i) => {
      collector.resetTimer(); // Reset the main collector's timeout
      equipCollector.resetTimer(); // Reset the equip collector's timeout

      const [_, itemType, itemId] = i.customId.split("_");
      const userItem = await getUserItemById(
        userId,
        guildId,
        Number(itemId),
        itemType as "FishingRod" | "Bait"
      );
      await equipUserItem(userId, guildId, userItem);

      // Update the embed to reflect the newly equipped item
      inventoryItems = await getUserItemsFromInventory(userId, guildId);
      const updatedItems =
        itemType === "FishingRod"
          ? await this.buildUserFishingRodInventory(
              inventoryItems,
              userId,
              guildId
            )
          : this.buildUserBaitInventory(inventoryItems);

      embed.spliceFields(0, 1, {
        name: itemType === "FishingRod" ? "🎣 Fishing Rods" : "🪱 Bait",
        value: updatedItems,
      });

      // Update the equip buttons, disabling the newly equipped button
      const updatedEquipRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        inventoryItems
          .filter((item) => item.itemType === itemType)
          .map((item) =>
            new ButtonBuilder()
              .setCustomId(`equip_${item.itemType}_${item.itemId}`)
              .setDisabled(item.equipped)
              .setEmoji(
                item.itemType === "FishingRod"
                  ? getFishingRodById(item.itemId).icon
                  : getBaitById(item.itemId).icon
              )
              .setLabel(
                `Equip ${
                  item.itemType === "FishingRod"
                    ? getFishingRodById(item.itemId).name
                    : getBaitById(item.itemId).name
                }`
              )
              .setStyle(ButtonStyle.Success)
          )
      );

      try {
        await i.update({
          allowedMentions: { repliedUser: false },
          embeds: [embed],
          components: [mainRow, updatedEquipRow],
        });
      } catch (error) {
        this.botClient.logger.error("Error updating interaction:", error);
      }
    });

    equipCollector.on("end", async () => {
      try {
        await interaction.message.edit({ components: [] });
      } catch (error) {
        this.botClient.logger.error("Error editing message:", error);
      }
    });
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
        return `${code(`${item.quantity}x`)} ${fishingRod.icon} ${
          fishingRod.name
        } ${isEquipped ? " " + code("[Equipped]") : ""}`;
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
        const bait = getBaitById(item.itemId);
        return `${code(`${item.quantity}x`)} ${bait.icon} ${bait.name} ${
          item.equipped ? " " + code("[Equipped]") : ""
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
