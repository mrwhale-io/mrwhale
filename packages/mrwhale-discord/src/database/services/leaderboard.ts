import { ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";

import {
  createChestsOpenedLeaderboardTable,
  createExpLeaderboardTable,
  createFishCaughtLeaderboardTable,
  createGemsLeaderboardTable,
} from "../../util/embed/leaderboard-table-helpers";
import {
  getGlobalChestsOpenedScores,
  getGuildChestsOpenedScores,
} from "./chests-opened-leaderboard";
import {
  getGlobalFishCaughtScores,
  getGuildFishCaughtScores,
} from "./fish-caught-leaderboard";
import { getGlobalExpScores, getGuildExpScores } from "./exp-leaderboard";
import { getGlobalGemsScores, getGuildGemsScores } from "./gems-leaderboard";

/**
 * Retrieves a leaderboard table embed of the specified type.
 *
 * This function fetches and constructs an embed for a leaderboard of the given type.
 * It supports both global and guild-specific leaderboards, and the results are paginated.
 *
 * @param interactionOrMessage The Discord command interaction or message.
 * @param type The type of leaderboard to retrieve. Supported types are "exp" and "fishcaught".
 * @param page The page number to retrieve.
 * @param isGlobal Indicates whether to retrieve a global leaderboard or a guild-specific leaderboard. Defaults to false.
 * @returns A Promise that resolves to an object containing the embed table and the total number of pages.
 */
export async function getLeaderboardTable(
  interactionOrMessage: ChatInputCommandInteraction | Message,
  type: string,
  page: number,
  isGlobal: boolean = false
): Promise<{ table: EmbedBuilder; pages: number }> {
  switch (type) {
    case "exp":
      return getExpLeaderboardTable(interactionOrMessage, page, isGlobal);

    case "fishcaught":
      return getFishCaughtLeaderboardTable(
        interactionOrMessage,
        page,
        isGlobal
      );

    case "chestsopened":
      return getChestsOpenedLeaderboardTable(
        interactionOrMessage,
        page,
        isGlobal
      );

    case "gems":
      return getGemsLeaderboardTable(interactionOrMessage, page, isGlobal);
  }
}

async function getExpLeaderboardTable(
  interactionOrMessage: ChatInputCommandInteraction | Message,
  page: number,
  isGlobal: boolean = false
) {
  const expScores = isGlobal
    ? await getGlobalExpScores(interactionOrMessage, page)
    : await getGuildExpScores(interactionOrMessage, page);

  return {
    table: await createExpLeaderboardTable(
      interactionOrMessage,
      expScores,
      page,
      isGlobal
    ),
    pages: expScores.pages,
  };
}

async function getFishCaughtLeaderboardTable(
  interactionOrMessage: ChatInputCommandInteraction | Message,
  page: number,
  isGlobal: boolean = false
) {
  const fishCaughtScores = isGlobal
    ? await getGlobalFishCaughtScores(interactionOrMessage, page)
    : await getGuildFishCaughtScores(interactionOrMessage, page);

  return {
    table: await createFishCaughtLeaderboardTable(
      interactionOrMessage,
      fishCaughtScores,
      page,
      isGlobal
    ),
    pages: fishCaughtScores.pages,
  };
}

async function getChestsOpenedLeaderboardTable(
  interactionOrMessage: ChatInputCommandInteraction | Message,
  page: number,
  isGlobal: boolean = false
) {
  const chestsOpenedScores = isGlobal
    ? await getGlobalChestsOpenedScores(interactionOrMessage, page)
    : await getGuildChestsOpenedScores(interactionOrMessage, page);

  return {
    table: await createChestsOpenedLeaderboardTable(
      interactionOrMessage,
      chestsOpenedScores,
      page,
      isGlobal
    ),
    pages: chestsOpenedScores.pages,
  };
}

async function getGemsLeaderboardTable(
  interactionOrMessage: ChatInputCommandInteraction | Message,
  page: number,
  isGlobal: boolean = false
) {
  const gemsScores = isGlobal
    ? await getGlobalGemsScores(interactionOrMessage, page)
    : await getGuildGemsScores(interactionOrMessage, page);

  return {
    table: await createGemsLeaderboardTable(
      interactionOrMessage,
      gemsScores,
      page,
      isGlobal
    ),
    pages: gemsScores.pages,
  };
}
