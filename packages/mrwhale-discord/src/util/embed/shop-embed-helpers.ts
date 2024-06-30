import { EmbedBuilder, User, bold } from "discord.js";

import { getLevelFromExp } from "@mrwhale-io/core";
import { DiscordBotClient } from "../../client/discord-bot-client";
import {
  getBaitsAvailable,
  getFishingRodsAvailable,
} from "../shop-item-helpers";
import { paginate } from "../paginate";
import { EMBED_COLOR } from "../../constants";
import { LevelManager } from "../../client/managers/level-manager";

interface ShopItemOptions {
  itemType: string;
  guildId: string;
  discordUser: User;
  pageNumber: number;
  botClient: DiscordBotClient;
}

interface ShopPage {
  title: string;
  description: string;
  items: {
    name: string;
    value: string;
  }[];
}

const SHOP_PAGE_SIZE = 3;

/**
 * Generates an embed for the shop items based on the specified item type and user's level.
 *
 * @param options The options for generating the shop embed.
 * @param options.itemType The type of the items to be retrieved (e.g. "FishingRod", "Bait").
 * @param options.discordUser - The Discord user for whom the shop items are being fetched.
 * @param options.pageNumber - The current page number for pagination.
 * @param options.guildId The Id of the guild in which the shop is being accessed.
 * @param options.botClient The bot client instance.
 */
export async function getShopItemsEmbed(
  options: ShopItemOptions
): Promise<{ embed: EmbedBuilder; pages: number }> {
  const { itemType, discordUser, pageNumber, guildId, botClient } = options;

  try {
    const userBalance = await botClient.getUserBalance(discordUser.id, guildId);
    const userScore = await LevelManager.getUserScore(guildId, discordUser.id);
    const userLevel = userScore ? getLevelFromExp(userScore.exp) : 0;

    const { title, description, items } = await getShopPageForItemType(
      itemType,
      userLevel
    );
    const { page, pages } = paginate(items, SHOP_PAGE_SIZE, pageNumber);

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setAuthor({
        name: `Shop: ${title}`,
        iconURL: discordUser.avatarURL(),
      })
      .setDescription(description)
      .addFields(page)
      .setFooter({
        text: `Page ${pageNumber}/${pages} | 💎 Your Balance: ${userBalance}`,
      });

    return { embed, pages };
  } catch (error) {
    botClient.logger.error("Error generating shop items embed:", error);
    throw new Error("Failed to generate shop items embed.");
  }
}

/**
 * Retrieves a list of shop items available for purchase based on the item type and user's level.
 *
 * This function determines the type of items to be retrieved (e.g., FishingRod, Bait) and calls the
 * appropriate function to get the shop page details. The returned shop page contains information
 * about the items that the user can purchase at their current level.
 *
 * @param itemType The type of the items to be retrieved (e.g. "FishingRod", "Bait").
 * @param userLevel The current level of the user.
 * @throws Throws an error if an invalid item type is provided.
 */
function getShopPageForItemType(
  itemType: string,
  userLevel: number
): Promise<ShopPage> {
  switch (itemType) {
    case "FishingRod":
      return getFishingRodPage(userLevel);

    case "Bait":
      return getBaitPage(userLevel);

    default:
      throw new Error(`Invalid item type: ${itemType}`);
  }
}

/**
 * Retrieves a list of fishing rods available for purchase based on the user's level.
 *
 * This function queries the available fishing rods for the given user level and prepares a shop
 * page containing the fishing rods that the user can purchase. It also includes information about
 * the next unlockable fishing rod.
 *
 * @param userLevel The current level of the user.
 */
async function getFishingRodPage(userLevel: number): Promise<ShopPage> {
  const {
    availableFishingRods,
    nextUnlockableFishingRod,
  } = await getFishingRodsAvailable(userLevel);
  const shopItems = availableFishingRods.map((rod) => ({
    name: `${rod.icon} ${rod.name} ${
      rod.minLevel === userLevel ? "`NEW`" : ""
    }`,
    value: `**Description**: ${rod.description}\n**Cost**: 💎 ${rod.cost} gems\n**Probability Multiplier**: ${rod.probabilityMultiplier}`,
  }));

  return {
    title: `Fishing Rods 🎣`,
    description: nextUnlockableFishingRod
      ? `Next Fishing Rod: ${nextUnlockableFishingRod.icon} ${bold(
          nextUnlockableFishingRod.name
        )}\nUnlocked at **Level ${nextUnlockableFishingRod.minLevel}**`
      : "You've unlocked all fishing rods.",
    items: shopItems,
  };
}

/**
 * Retrieves a list of bait available for purchase based on the user's level.
 *
 * This function queries the bait for the given user level and prepares a shop
 * page containing the bait that the user can purchase. It also includes information about
 * the next unlockable bait.
 *
 * @param userLevel The current level of the user.
 */
async function getBaitPage(userLevel: number): Promise<ShopPage> {
  const { availableBaits, nextUnlockableBait } = await getBaitsAvailable(
    userLevel
  );
  const shopItems = availableBaits.map((bait) => ({
    name: `${bait.icon} ${bait.name} ${
      bait.minLevel === userLevel ? "`NEW`" : ""
    }`,
    value: `**Description**: ${bait.description}\n**Cost**: 💎 ${bait.cost} gems\n**Effectiveness**: ${bait.effectiveness}`,
  }));

  return {
    title: `Bait 🪱`,
    description: nextUnlockableBait
      ? `Next Bait: ${nextUnlockableBait.icon} ${bold(
          nextUnlockableBait.name
        )}\nUnlocked at **Level ${nextUnlockableBait.minLevel}**`
      : "You've unlocked all baits.",
    items: shopItems,
  };
}
