import { EmbedBuilder } from "discord.js";

import {
  FED_MESSAGES,
  Fish,
  Mood,
  getLevelFromExp,
  getRemainingExp,
  levelToExp,
} from "@mrwhale-io/core";
import { DiscordBotClient } from "../../client/discord-bot-client";
import { EMBED_COLOR } from "../../constants";
import { LevelManager } from "../../client/managers/level-manager";
import { drawHealthBar } from "../draw-health-bar";
import { FeedResult } from "../../types/fishing/feed-result";

interface RewardEmbedOptions {
  fish: Fish;
  quantity: number;
  balance: number;
  result: FeedResult;
  guildId: string;
  userId: string;
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
    botClient,
    fish,
    quantity,
    balance,
    result,
    userId,
    guildId,
  } = options;

  const userScore = await LevelManager.getUserScore(guildId, userId);
  const currentMood = botClient.getCurrentMood(guildId);
  const fedMessage = getFedMessage(currentMood);
  const currentProgress = Math.floor((result.hungerLevel / 100) * 100);
  const whaleAvatar = botClient.client.user.displayAvatarURL();
  const level = getLevelFromExp(userScore.exp);
  const remainingExp = levelToExp(level) - getRemainingExp(userScore.exp);

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setThumbnail(whaleAvatar)
    .addFields([
      {
        name: "Gems Rewarded",
        value: `💎 +${result.reward}`,
        inline: true,
      },
      {
        name: "Your Current Balance",
        value: `💰 ${balance}`,
        inline: true,
      },
      {
        name: "Exp Gained",
        value: `🆙 +${result.expGained}`,
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
        value: `${drawHealthBar(result.hungerLevel)} ${currentProgress}%`,
      },
    ])
    .setTitle(`You just fed me ${quantity} ${fish.name} ${fish.icon}`)
    .setDescription(`${fedMessage}\n\nHere is your reward:`)
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
