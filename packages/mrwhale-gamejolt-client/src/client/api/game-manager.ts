import { Game } from "../../structures/game";
import { GameOverview } from "../../structures/game-overview";
import { Endpoints } from "../../constants";
import { ApiData } from "../../types/api-data";
import { APIRequestManager } from "./api-request-manager";

/** Game filter types for discovery */
export type GameFilterType = "featured" | "hot" | "new" | "best" | "random";

/** Game price types for discovery */
export type GamePriceType =
  | "free"
  | "paid"
  | "name-your-price"
  | "5-to-15"
  | "15-and-up";

/** Operating system types for discovery */
export type GameOperatingSystem = "windows" | "mac" | "linux" | "other";

/** Game platform types for discovery */
export type GamePlatformType = "html" | "flash" | "unity" | "silverlight";

/** Game maturity types for discovery */
export type GameMaturityType = "all" | "teen" | "mature";

/**
 * Parameters for discovering games on Game Jolt.
 */
export interface DiscoverParams {
  /**
   * Section of games to discover.
   * Examples: 'featured', 'hot', 'new', 'best', 'random'
   */
  section?: GameFilterType;

  /**
   * Price filter for games.
   * Examples: 'free', 'paid', 'name-your-price', '5-to-15', '15-and-up'
   */
  price?: GamePriceType;

  /**
   * Operating system compatibility filter.
   * Examples: 'windows', 'mac', 'linux', 'other'
   */
  os?: GameOperatingSystem;

  /**
   * Browser compatibility filter.
   * Examples: 'html', 'flash', 'unity', 'silverlight'
   */
  browser?: GamePlatformType;

  /**
   * Content maturity rating filter.
   * Examples: 'all', 'teen', 'mature'
   */
  maturity?: GameMaturityType;

  /**
   * Number of games to fetch (optional).
   * Defaults to server limit if not specified.
   */
  limit?: number;

  /**
   * Page offset for pagination (optional).
   */
  page?: number;
}

/**
 * Response structure for game discovery API.
 */
export interface DiscoverResponse {
  /** Array of games matching the discovery criteria */
  games: Partial<Game>[];
  /** Total number of games available with current filters */
  count?: number;
  /** Current page number */
  page?: number;
  /** Whether there are more results available */
  hasMore?: boolean;
}

/**
 * API manager for Game Jolt game data operations.
 *
 * The GameManager provides access to game information and metadata from the Game Jolt platform.
 * It handles retrieval of detailed game information, overviews, and other game-related data.
 *
 * ## Features:
 * - **Game Information**: Retrieve complete game details including metadata, descriptions, and media
 * - **Game Overviews**: Get summarized game information for listings and previews
 * - **Error Handling**: Comprehensive error handling for missing or invalid games
 * - **Type Safety**: Strongly typed responses with proper Game and GameOverview objects
 *
 * ## Game Data Types:
 * - **Full Game Data**: Complete game information including all metadata
 * - **Game Overview**: Summarized information suitable for game listings
 * - **Media Assets**: Associated images, screenshots, and other media
 *
 * @example
 * ```typescript
 * // Get detailed game information
 * try {
 *   const game = await client.api.games.getGame(12345);
 *   console.log(`Game: ${game.title}`);
 *   console.log(`Developer: ${game.developer.username}`);
 *   console.log(`Description: ${game.description_markdown}`);
 * } catch (error) {
 *   console.error('Game not found:', error);
 * }
 *
 * // Get game overview for listing
 * const overview = await client.api.games.getGameOverview(12345);
 * console.log(`Quick info: ${overview.title} - ${overview.category}`);
 * ```
 */
export class GameManager extends APIRequestManager {
  /**
   * Retrieves complete information about a specific game.
   *
   * Fetches comprehensive game data including metadata, description, media,
   * developer information, and other detailed properties from Game Jolt.
   *
   * @param gameId - The unique identifier of the game to retrieve.
   * @returns A Promise that resolves to a Game object containing all game details.
   * @throws {Error} When the game is not found, access is denied, or API request fails.
   *
   * @example
   * ```typescript
   * try {
   *   const game = await gameManager.getGame(12345);
   *
   *   console.log(`Title: ${game.title}`);
   *   console.log(`Developer: ${game.developer.username}`);
   *   console.log(`Category: ${game.category}`);
   *   console.log(`Status: ${game.status}`);
   *   console.log(`Followers: ${game.follower_count}`);
   *   console.log(`Rating: ${game.rating_count} ratings`);
   *
   *   // Access game description
   *   if (game.description_markdown) {
   *     console.log('Description:', game.description_markdown);
   *   }
   *
   *   // Check if game is published
   *   if (game.status === 'visible') {
   *     console.log('Game is published and visible to users');
   *   }
   * } catch (error) {
   *   if (error.message.includes('Game data is missing')) {
   *     console.error('Game not found or access denied');
   *   } else {
   *     console.error('Failed to fetch game:', error);
   *   }
   * }
   * ```
   *
   * @remarks
   * - Private or unpublished games may not be accessible depending on permissions
   * - Deleted games will throw an error
   * - Game data includes media, ratings, comments, and developer information
   */
  async getGame(gameId: number): Promise<Game> {
    const data = await this.get<ApiData<{ game: Partial<Game> }>>(
      Endpoints.games.info(gameId),
    );

    if (!data.payload?.game) {
      throw new Error("Game data is missing in the response.");
    }

    return new Game(data.payload.game);
  }

  /**
   * Retrieves a summarized overview of a specific game.
   *
   * Fetches condensed game information suitable for game listings, previews,
   * and situations where full game details aren't needed. This is typically
   * faster than fetching complete game information.
   *
   * @param gameId - The unique identifier of the game to get overview for.
   * @returns A Promise that resolves to a GameOverview object with summarized game data.
   * @throws {Error} When the game is not found, access is denied, or API request fails.
   *
   * @example
   * ```typescript
   * // Get game overview for a game listing
   * try {
   *   const overview = await gameManager.getGameOverview(67890);
   *
   *   console.log(`${overview.title} (${overview.category})`);
   *   console.log(`By: ${overview.developer}`);
   *
   *   // Display in a game grid or list
   *   displayGameCard({
   *     title: overview.title,
   *     thumbnail: overview.thumbnail_url,
   *     developer: overview.developer,
   *     category: overview.category
   *   });
   *
   * } catch (error) {
   *   console.error('Failed to fetch game overview:', error);
   * }
   *
   * // Batch fetch overviews for multiple games
   * const gameIds = [123, 456, 789];
   * const overviews = await Promise.all(
   *   gameIds.map(id => gameManager.getGameOverview(id))
   * );
   * ```
   *
   * @remarks
   * - Overview data is optimized for performance and contains essential information
   * - Use this method for game listings, search results, and preview displays
   * - For detailed game information, use `getGame()` instead
   * - Overview includes basic metadata but may exclude detailed descriptions
   */
  async getGameOverview(gameId: number): Promise<GameOverview> {
    const data = await this.get<ApiData<GameOverview>>(
      Endpoints.games.overview(gameId),
    );
    return new GameOverview(data.payload);
  }

  /**
   * Discovers games on Game Jolt based on specified criteria.
   *
   * Searches and retrieves games from Game Jolt using various filters
   * such as section, price, platform compatibility, and content rating.
   * This method is ideal for implementing game discovery features,
   * browsing interfaces, and recommendation systems.
   *
   * @param params - Optional discovery parameters to filter results
   * @returns A Promise that resolves to an array of Game objects matching the criteria
   * @throws {Error} When the API request fails or returns invalid data
   *
   * @example
   * ```typescript
   * // Get featured games
   * const featured = await gameManager.discover({
   *   section: 'featured',
   *   limit: 10
   * });
   *
   * // Get free Windows games
   * const freeGames = await gameManager.discover({
   *   price: 'free',
   *   os: 'windows',
   *   maturity: 'all'
   * });
   *
   * // Get hot browser games
   * const browserGames = await gameManager.discover({
   *   section: 'hot',
   *   browser: 'html',
   *   limit: 20
   * });
   *
   * // Random discovery
   * const randomGames = await gameManager.discover({
   *   section: 'random',
   *   limit: 5
   * });
   * ```
   *
   * @remarks
   * - All parameters are optional - omitting them returns general results
   * - Section parameter determines sort order and filtering logic
   * - Price and platform filters can be combined for specific targeting
   * - Results are returned as partial Game objects with essential data
   * - Use getGame() for complete details on specific games from results
   */
  async discover(params: DiscoverParams = {}): Promise<Game[]> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      if (params.section) {
        queryParams.set("section", params.section);
      }

      if (params.price) {
        queryParams.set("price", params.price);
      }

      if (params.os) {
        queryParams.set("os", params.os);
      }

      if (params.browser) {
        queryParams.set("browser", params.browser);
      }

      if (params.maturity) {
        queryParams.set("maturity", params.maturity);
      }

      if (params.limit) {
        queryParams.set("limit", params.limit.toString());
      }

      if (params.page) {
        queryParams.set("page", params.page.toString());
      }

      // Build URL with query parameters
      const queryString = queryParams.toString();
      const url = queryString
        ? `${Endpoints.games.discover}?${queryString}`
        : Endpoints.games.discover;

      // Make API request
      const data = await this.get<ApiData<DiscoverResponse>>(url);

      if (!data.payload?.games) {
        return [];
      }

      // Convert response to Game objects
      return data.payload.games.map((gameData) => new Game(gameData));
    } catch (error) {
      throw new Error(`Failed to discover games: ${error.message}`);
    }
  }
}
