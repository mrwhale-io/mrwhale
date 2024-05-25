import { EmbedBuilder, User, bold } from "discord.js";

import { getLevelFromExp } from "@mrwhale-io/core";
import { DiscordBotClient } from "../../client/discord-bot-client";
import {
  getFishingRodsAvailable,
  getShopItemsByType,
} from "../shop-item-helpers";
import { paginate } from "../paginate";
import { EMBED_COLOR } from "../../constants";
import { LevelManager } from "../../client/managers/level-manager";

interface ShopItemOptions {
  itemType: string;
  discordUser: User;
  guildId: string;
  pageNumber: number;
  botClient: DiscordBotClient;
}

export async function getShopItemsEmbed(
  options: ShopItemOptions
): Promise<{ embed: EmbedBuilder; pages: number }> {
  const pageSize = 5;
  const { itemType, discordUser, pageNumber, guildId, botClient } = options;
  const user = botClient.users.get(discordUser.id);
  const userScore = await LevelManager.getUserScore(guildId, user.id);
  const userLevel = getLevelFromExp(userScore.exp);
  const embed = new EmbedBuilder().setColor(EMBED_COLOR);

  let title = "";
  let shopItems: {
    name: string;
    value: string;
  }[] = [];

  if (itemType === "FishingRod") {
    title = `Fishing Rods 🎣`;
    const {
      availableFishingRods,
      nextUnlockableFishingRod,
    } = await getFishingRodsAvailable(userLevel);

    shopItems = availableFishingRods.map((rod) => ({
      name: `${rod.icon} ${rod.name} ${
        rod.minLevel === userLevel ? "NEW" : ""
      }`,
      value: `**Description**: ${rod.description}\n**Cost**: 💎 ${rod.cost} gems\n**Probability Multiplier**: ${rod.probabilityMultiplier}`,
    }));
    embed.setDescription(
      `Next Fishing Rod: ${nextUnlockableFishingRod.icon} ${bold(
        nextUnlockableFishingRod.name
      )}\nUnlocked at **Level ${nextUnlockableFishingRod.minLevel}**`
    );
  } else if (itemType === "Bait") {
    title = "Bait 🪤";
    const baits = getShopItemsByType(itemType);
    shopItems = baits.map((bait) => ({
      name: `${bait.icon} ${bait.name}`,
      value: `**Description**: ${bait.description}\n**Cost**: 💎 ${bait.cost} gems\n**Effectiveness**: ${bait.effectiveness}`,
    }));
  }
  const { page, pages } = paginate(shopItems, pageSize, pageNumber);
  embed
    .setAuthor({
      name: `Shop | ${title}`,
      iconURL: discordUser.avatarURL(),
    })
    .addFields(page)
    .setFooter({
      text: `Page ${pageNumber}/${pages} | 💎 Your Balance: ${user.balance}`,
    });

  return { embed, pages };
}
