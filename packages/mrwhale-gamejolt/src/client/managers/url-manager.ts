import { ListenerDecorators, truncate } from "@mrwhale-io/core";
import {
  Message,
  Game,
  GameOverview,
  Content,
  Events,
} from "@mrwhale-io/gamejolt-client";

import { GameJoltBotClient } from "../gamejolt-bot-client";

const { on, registerListeners } = ListenerDecorators;

// Configuration
const RATE_LIMIT_COOLDOWN = 10000; // 10 seconds between game info responses per room
const MAX_TITLE_LENGTH = 40;
const MAX_AUTHOR_LENGTH = 25;

// Rate limiting tracker
interface RoomRateLimit {
  lastResponse: number;
}

/**
 * UrlManager listens for messages containing Game Jolt game URLs and responds with formatted game information.
 */
export class UrlManager {
  private roomRateLimits: Map<number, RoomRateLimit> = new Map();

  constructor(private bot: GameJoltBotClient) {
    registerListeners(this.bot.client, this);
    this.bot.logger?.info("UrlManager initialized");
  }

  /**
   * Checks if we can respond based on rate limiting.
   * Prevents spamming game info if multiple URLs are posted in quick succession in the same room.
   */
  private canRespond(roomId: number): boolean {
    const now = Date.now();
    const roomLimit = this.roomRateLimits.get(roomId);

    if (roomLimit && now - roomLimit.lastResponse < RATE_LIMIT_COOLDOWN) {
      return false;
    }

    return true;
  }

  /**
   * Updates rate limiting for a room.
   */
  private updateRateLimit(roomId: number): void {
    this.roomRateLimits.set(roomId, {
      lastResponse: Date.now(),
    });
  }

  @on(Events.MESSAGE)
  private async onMessage(message: Message): Promise<void> {
    try {
      // Skip own messages
      if (message.user.id === this.bot.chat.currentUser?.id) {
        return;
      }

      // Check rate limiting
      if (!this.canRespond(message.room_id)) {
        return;
      }

      const gameRegex =
        /(http:|https:)?\/\/(www\.)?(gamejolt\.com)\/(games)\/[^/]+\/(\d+)/i;

      // Check if this is a Game Jolt game URL
      const matches = message.textContent.match(gameRegex);
      if (matches) {
        const gameId = parseInt(matches[matches.length - 1], 10);

        if (isNaN(gameId) || gameId <= 0) {
          this.bot.logger?.warn(`Invalid game ID extracted: ${gameId}`);
          return;
        }

        this.updateRateLimit(message.room_id);

        try {
          // Fetch game data with timeout
          const [gameResult, overviewResult] = await Promise.all([
            this.bot.client.api.games.getGame(gameId),
            this.bot.client.api.games.getGameOverview(gameId),
          ]);

          if (!gameResult || !overviewResult) {
            this.bot.logger?.warn(
              `Failed to fetch data for game ID: ${gameId}`,
            );
            return;
          }

          const game = new Game(gameResult);
          const overview = new GameOverview(overviewResult);
          const gameInfo = formatGameInfo(game, overview);

          if (gameInfo) {
            await this.bot.chat.sendMessage(gameInfo, message.room_id);

            this.bot.logger?.debug(
              `Sent game info for: ${game.title} (ID: ${gameId})`,
            );
          }
        } catch (apiError) {
          this.bot.logger?.error(
            `API error fetching game ${gameId}:`,
            apiError,
          );

          // Send a simple fallback message
          const fallbackContent = new Content("chat-message");
          fallbackContent.insertText(
            `🎮 Game Jolt game detected, but I couldn't fetch the details right now.`,
          );
          await this.bot.chat.sendMessage(fallbackContent, message.room_id);
        }
      }
    } catch (error) {
      this.bot.logger?.error("Error in UrlManager onMessage:", error);
    }
  }

  /**
   * Gets rate limiting statistics
   */
  getStats() {
    return {
      activeRooms: this.roomRateLimits.size,
      rateLimits: Object.fromEntries(this.roomRateLimits),
    };
  }
}

/**
 * Formats large numbers in a human-readable way
 * @param num The number to format
 * @returns A string representing the formatted number (e.g., "1.2K", "3.4M")
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

/**
 * Formats a date timestamp to a readable format
 * @returns A string representing how long ago the date was from now (e.g., "2 days ago", "3 months ago")
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
  return `${Math.ceil(diffDays / 365)} years ago`;
}

/**
 * Gets the appropriate TIGRS rating emoji based on the rating value
 * @param rating The TIGRS age rating of the game (1 = Everyone, 2 = Teen, 3 = Mature, 0 or other = Unrated)
 * @returns A string containing the corresponding emoji for the TIGRS rating
 */
function getTIGRSEmoji(rating: number): string {
  if (rating === 1) return "🟢"; // Everyone
  if (rating === 2) return "🟡"; // Teen
  if (rating === 3) return "🔴"; // Mature
  return "⚪"; // Unrated
}

/**
 * Gets the human-readable text for a TIGRS age rating
 * @param rating The TIGRS age rating of the game (1 = Everyone, 2 = Teen, 3 = Mature, 0 or other = Unrated)
 * @returns A string describing the TIGRS rating in human-readable form
 */
function getTIGRSText(rating: number): string {
  if (rating === 1) return "Everyone";
  if (rating === 2) return "Teen";
  if (rating === 3) return "Mature";
  return "Unrated";
}

/**
 * Format Game Jolt game data for displaying in chat with rich formatting
 * @param game Game Jolt game.
 * @param overview Game Jolt game overview.
 * @returns Formatted game information string or null if invalid data
 */
function formatGameInfo(game: Game, overview: GameOverview): string | null {
  if (!game || !game.developer || !overview) {
    return null;
  }

  try {
    const title = truncate(MAX_TITLE_LENGTH, game.title || "Unknown Game");
    const author = truncate(
      MAX_AUTHOR_LENGTH,
      game.developer.display_name ||
        game.developer.username ||
        "Unknown Developer",
    );
    const category = game.category || "Uncategorized";
    const followers = formatNumber(game.follower_count || 0);
    const views = formatNumber(overview.profileCount || 0);
    const totalPlays = formatNumber(
      (overview.downloadCount || 0) + (overview.playCount || 0),
    );
    const tigrsEmoji = getTIGRSEmoji(game.tigrs_age);
    const tigrsText = getTIGRSText(game.tigrs_age);
    const publishedDate = game.published_on
      ? formatDate(game.published_on)
      : "Recently";

    // Create sections
    const titleSection = `🎮 ${title} by ${author}`;
    const statsSection = `👥 ${followers} followers • 👀 ${views} views • 🎯 ${totalPlays} plays`;
    const infoSection = `📂 ${category} • TIGRS: ${tigrsEmoji} (${tigrsText}) • 📅 Published ${publishedDate}`;

    // Optional tool information
    let toolSection = "";
    if (game.creation_tool_human && game.creation_tool_human !== "Other") {
      toolSection = `\n🛠️ Made with ${game.creation_tool_human}`;
    }

    return `\n${titleSection}\n${statsSection}\n${infoSection}${toolSection}`;
  } catch (error) {
    return `🎮 ${game.title || "Game"} - Error formatting game info`;
  }
}
