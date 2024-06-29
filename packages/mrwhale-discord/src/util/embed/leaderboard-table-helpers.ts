import { ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";

import { code } from "@mrwhale-io/core";
import { EMBED_COLOR } from "../../constants";
import { ScoreResult } from "../../types/scores/score-result";

interface LeaderboardOptions {
  scoreResult: ScoreResult;
  page: number;
  title: string;
  isGlobal: boolean;
}

/**
 * Creates a generic embed for the leaderboard table.
 * @param interactionOrMessage The discord command interaction or message.
 * @param leaderboardOptions The options for the leaderboard.
 */
export async function createLeaderboardTable(
  interactionOrMessage: Message | ChatInputCommandInteraction,
  leaderboardOptions: LeaderboardOptions
): Promise<EmbedBuilder> {
  const { title, scoreResult, page, isGlobal } = leaderboardOptions;
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle(title)
    .setTimestamp()
    .setFooter({ text: `Page ${page}/${scoreResult.pages}` });

  if (scoreResult.scores.length < 1) {
    return embed.setDescription("No one is ranked.");
  }

  if (!isGlobal) {
    embed.setAuthor({
      name: interactionOrMessage.guild.name,
      iconURL: interactionOrMessage.guild.iconURL(),
    });
  }

  return embed;
}

/**
 * Creates an embed for the exp leaderboard table.
 * @param interactionOrMessage The discord command interaction or message.
 * @param scoreResult Contains a list of scores results.
 * @param page The page number.
 * @param isGlobal Whether this is a global leaderboard or not.
 */
export async function createExpLeaderboardTable(
  interactionOrMessage: Message | ChatInputCommandInteraction,
  scoreResult: ScoreResult,
  page: number,
  isGlobal: boolean = false
): Promise<EmbedBuilder> {
  const title = isGlobal
    ? "Top Global Levels"
    : `Top Levels in ${interactionOrMessage.guild.name}`;
  const embed = await createLeaderboardTable(interactionOrMessage, {
    scoreResult,
    page,
    title,
    isGlobal,
  });
  let table = "Here are the top players for this leaderboard.\n\n";
  for (let i = 0; i < scoreResult.scores.length; i++) {
    const score = scoreResult.scores[i];
    const place = i + scoreResult.offset + 1;
    table += `${code(`#${place}`)} ${getPlaceEmoji(place)} | @${
      score.user.username
    } • **Exp: ${score.exp} (Level ${score.level})**\n`;
  }

  return embed.setDescription(table);
}

/**
 * Creates an embed for the fish caught leaderboard table.
 * @param interactionOrMessage The discord command interaction or message.
 * @param scoreResult Contains a list of scores results.
 * @param page The page number.
 * @param isGlobal Whether this is a global leaderboard or not.
 */
export async function createFishCaughtLeaderboardTable(
  interactionOrMessage: Message | ChatInputCommandInteraction,
  scoreResult: ScoreResult,
  page: number,
  isGlobal: boolean = false
): Promise<EmbedBuilder> {
  const title = isGlobal
    ? "Fish Caught"
    : `Fish Caught in ${interactionOrMessage.guild.name}`;
  const embed = await createLeaderboardTable(interactionOrMessage, {
    scoreResult,
    page,
    title,
    isGlobal,
  });
  let table = "Here are the top players for this leaderboard.\n\n";
  for (let i = 0; i < scoreResult.scores.length; i++) {
    const score = scoreResult.scores[i];
    const place = i + scoreResult.offset + 1;
    table += `${code(`#${place}`)} ${getPlaceEmoji(place)} | @${
      score.user.username
    } • **${score.exp}**\n`;
  }

  return embed.setDescription(table);
}

function getPlaceEmoji(place: number): string {
  if (place === 1) {
    return "🥇";
  } else if (place === 2) {
    return "🥈";
  } else if (place === 3) {
    return "🥉";
  }

  return "";
}
