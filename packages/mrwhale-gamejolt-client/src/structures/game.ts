import { User } from "./user";

/**
 * Represents a game on the platform.
 */
export class Game {
  /**
   * The unique identifier for the game.
   */
  readonly id: number;

  /**
   * The title of the game.
   */
  readonly title: string;

  /**
   * The developer of the game.
   */
  readonly developer: User;

  /**
   * The timestamp when the game was published.
   */
  readonly published_on: number;

  /**
   * The timestamp when the game was posted.
   */
  readonly posted_on: number;

  /**
   * The number of followers the game has.
   */
  readonly follower_count: number;

  /**
   * The TIGRS rating of the game.
   */
  readonly tigrs: number;

  /**
   * The tool used to create the game.
   */
  readonly creation_tool: string;

  /**
   * The human-readable name of the creation tool.
   */
  readonly creation_tool_human: string;

  /**
   * The category of the game.
   */
  readonly category: string;

  /**
   * @param data Partial data to initialize the game.
   */
  constructor(data: Partial<Game>) {
    Object.assign(this, data);
  }

  /**
   * Returns the title of the game.
   * @returns The title of the game.
   */
  toString(): string {
    return this.title;
  }
}
