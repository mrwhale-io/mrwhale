import { ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";

import { code } from "@mrwhale-io/core";
import { EMBED_COLOR } from "../../constants";
import { ScoreResult } from "../../types/scores/score-result";
import { MappedScores } from "../../types/scores/mapped-scores";

interface LeaderboardOptions {
  scoreResult: ScoreResult;
  page: number;
  title: string;
  isGlobal: boolean;
}

const TABLE_DESCRIPTION = "Here are the top players for this leaderboard.\n\n";

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
 * Creates an embed for the leaderboard table.
 * @param interactionOrMessage The discord command interaction or message.
 * @param scoreResult Contains a list of scores results.
 * @param page The page number.
 * @param isGlobal Whether this is a global leaderboard or not.
 * @param title The title of the leaderboard.
 * @param scoreFormatter A function to format the score for the leaderboard.
 */
async function createGenericLeaderboardTable(
  interactionOrMessage: Message | ChatInputCommandInteraction,
  scoreResult: ScoreResult,
  page: number,
  isGlobal: boolean,
  title: string,
  scoreFormatter: (score: MappedScores, place: number) => string
): Promise<EmbedBuilder> {
  const embed = await createLeaderboardTable(interactionOrMessage, {
    scoreResult,
    page,
    title,
    isGlobal,
  });

  let table = TABLE_DESCRIPTION;
  for (let i = 0; i < scoreResult.scores.length; i++) {
    const score = scoreResult.scores[i];
    const place = i + scoreResult.offset + 1;
    table += scoreFormatter(score, place);
  }

  return embed.setDescription(table);
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

  const formatter = (score: MappedScores, place: number) =>
    `${code(`#${place}`)} ${getPlaceEmoji(place)} | @${
      score.user ? score.user.username : "Unknown User"
    } • **Exp: ${score.exp} (Level ${score.level})**\n`;

  return createGenericLeaderboardTable(
    interactionOrMessage,
    scoreResult,
    page,
    isGlobal,
    title,
    formatter
  );
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
  return createGenericLeaderboardTable(
    interactionOrMessage,
    scoreResult,
    page,
    isGlobal,
    title,
    mapScoreResults
  );
}

/**
 * Creates an embed for the fish fed leaderboard table.
 * @param interactionOrMessage The discord command interaction or message.
 * @param scoreResult Contains a list of scores results.
 * @param page The page number.
 * @param isGlobal Whether this is a global leaderboard or not.
 */
export async function createFishFedLeaderboardTable(
  interactionOrMessage: Message | ChatInputCommandInteraction,
  scoreResult: ScoreResult,
  page: number,
  isGlobal: boolean = false
): Promise<EmbedBuilder> {
  const title = isGlobal
    ? "Fish Fed"
    : `Fish Fed in ${interactionOrMessage.guild.name}`;
  return createGenericLeaderboardTable(
    interactionOrMessage,
    scoreResult,
    page,
    isGlobal,
    title,
    mapScoreResults
  );
}

/**
 * Creates an embed for the chests opened leaderboard table.
 * @param interactionOrMessage The discord command interaction or message.
 * @param scoreResult Contains a list of scores results.
 * @param page The page number.
 * @param isGlobal Whether this is a global leaderboard or not.
 */
export async function createChestsOpenedLeaderboardTable(
  interactionOrMessage: ChatInputCommandInteraction | Message,
  scoreResult: ScoreResult,
  page: number,
  isGlobal: boolean = false
): Promise<EmbedBuilder> {
  const title = isGlobal
    ? "Chests Opened"
    : `Chests Opened in ${interactionOrMessage.guild.name}`;
  return createGenericLeaderboardTable(
    interactionOrMessage,
    scoreResult,
    page,
    isGlobal,
    title,
    mapScoreResults
  );
}

/**
 * Creates an embed for the gems leaderboard table.
 * @param interactionOrMessage The discord command interaction or message.
 * @param scoreResult Contains a list of scores results.
 * @param page The page number.
 * @param isGlobal Whether this is a global leaderboard or not.
 */
export async function createGemsLeaderboardTable(
  interactionOrMessage: ChatInputCommandInteraction | Message,
  scoreResult: ScoreResult,
  page: number,
  isGlobal: boolean = false
): Promise<EmbedBuilder> {
  const title = isGlobal
    ? "Gems Earned"
    : `Gems Earned in ${interactionOrMessage.guild.name}`;
  return createGenericLeaderboardTable(
    interactionOrMessage,
    scoreResult,
    page,
    isGlobal,
    title,
    mapScoreResults
  );
}

/**
 * Maps score results to a formatted string.
 * @param table The current table string.
 * @param place The place of the user.
 * @param score The score object.
 * @returns The updated table string.
 */
function mapScoreResults(score: MappedScores, place: number): string {
  return `${code(`#${place}`)} ${getPlaceEmoji(place)} | @${
    score.user ? score.user.username : "Unknown"
  } • **${score.exp}**\n`;
}

/**
 * Gets the emoji for the place.
 * @param place The place number.
 * @returns The emoji string.
 */
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
