/**
 * Represents an overview of a game with various statistics.
 */
export class GameOverview {
  /**
   * The number of times the game has been viewed.
   */
  profileCount: number;

  /**
   * The number of times the game has been downloaded.
   */
  downloadCount: number;

  /**
   * The number of times the game has been played.
   */
  playCount: number;

  /**
   * @param data Partial data to initialize the GameOverview instance.
   */
  constructor(data: Partial<GameOverview>) {
    Object.assign(this, data);
  }
}
