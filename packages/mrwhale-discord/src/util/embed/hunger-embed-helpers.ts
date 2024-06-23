import { EmbedBuilder } from "discord.js";

import {
  FED_MESSAGES,
  Fish,
  Mood,
  code,
  getLevelFromExp,
  getRemainingExp,
  levelToExp,
} from "@mrwhale-io/core";
import { DiscordBotClient } from "../../client/discord-bot-client";
import { EMBED_COLOR } from "../../constants";
import { LevelManager } from "../../client/managers/level-manager";
import { drawHealthBar } from "../draw-health-bar";

interface RewardEmbedOptions {
  fishFed: { fish: Fish; quantity: number }[];
  guildId: string;
  userId: string;
  totalExpGained: number;
  totalReward: number;
  botClient: DiscordBotClient;
}

/**
 * Generates an embed with the rewards details after feeding Mr. Whale.
 *
 * @param options The options for generating the reward embed.
 * @returns An EmbedBuilder containing the rewards details.
 */
export async function getFedRewardsEmbed(
  options: RewardEmbedOptions
): Promise<EmbedBuilder> {
  const {
    fishFed,
    guildId,
    userId,
    totalExpGained,
    totalReward,
    botClient,
  } = options;

  const userScore = await LevelManager.getUserScore(guildId, userId);
  const currentMood = await botClient.getCurrentMood(guildId);
  const fedMessage = getFedMessage(currentMood);
  const hungerLevel = await botClient.getGuildHungerLevel(guildId);
  const currentProgress = Math.floor((hungerLevel / 100) * 100);
  const whaleAvatar = botClient.client.user.displayAvatarURL();
  const level = getLevelFromExp(userScore.exp);
  const remainingExp = levelToExp(level) - getRemainingExp(userScore.exp);
  const userBalance = await botClient.getUserBalance(userId, guildId);
  const fedFishDescriptions = fishFed
    .map(
      ({ fish, quantity }) =>
        `${code(`${quantity}x`)} ${fish.icon} ${fish.name}`
    )
    .join("\n");

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setThumbnail(whaleAvatar)
    .addFields([
      {
        name: "Fish Fed",
        value: fedFishDescriptions,
      },
      {
        name: "Gems Rewarded",
        value: `💎 +${totalReward}`,
        inline: true,
      },
      {
        name: "Your Current Balance",
        value: `💰 ${userBalance}`,
        inline: true,
      },
      {
        name: "Exp Gained",
        value: `🆙 +${totalExpGained}`,
        inline: true,
      },
      {
        name: "Next Level",
        value: `⬆️ ${remainingExp} EXP to level ${
          getLevelFromExp(userScore.exp) + 1
        }`,
        inline: true,
      },
      {
        name: "Satiety Level",
        value: `${drawHealthBar(hungerLevel)} ${currentProgress}%`,
      },
    ])
    .setTitle(`You just fed Mr. Whale`)
    .setDescription(`${fedMessage}`)
    .setFooter({
      text: "Keep feeding Mr. Whale to get more rewards!",
      iconURL: whaleAvatar,
    })
    .setTimestamp();

  return embed;
}

/**
 * Retrieves a random fed message based on the current mood.
 *
 * @param currentMood The current mood of Mr. Whale.
 * @returns A random fed message.
 */
function getFedMessage(currentMood: Mood): string {
  const messages = FED_MESSAGES[currentMood];
  return messages[Math.floor(Math.random() * messages.length)];
}
