import { Game } from "../../structures/game";
import { GameOverview } from "../../structures/game-overview";
import { Endpoints } from "../../constants";
import { ApiData } from "../../types/api-data";
import { APIRequestManager } from "./api-request-manager";

/**
 * API request manager for Game Jolt games.
 */
export class GameManager extends APIRequestManager {
  /**
   * Gets a game by its identifier.
   * @param gameId The identifier of the game to get.
   * @returns The game data.
   */
  async getGame(gameId: number): Promise<Game> {
    const data = await this.get<ApiData<{ game: Partial<Game> }>>(
      Endpoints.game(gameId)
    );

    if (!data.payload?.game) {
      throw new Error("Game data is missing in the response.");
    }

    return new Game(data.payload.game);
  }

  /**
   * Gets a game overview by its identifier.
   * @param gameId The identifier of the game to get the overview for.
   * @returns The game overview data.
   */
  async getGameOverview(gameId: number): Promise<GameOverview> {
    const data = await this.get<ApiData<GameOverview>>(
      Endpoints.game_overview(gameId)
    );
    return new GameOverview(data.payload);
  }
}
