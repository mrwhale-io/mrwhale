import { User } from "./user";

/**
 * Represents a game on the platform.
 */
export class Game {
  /**
   * The unique identifier for the game.
   */
  id: number;

  /**
   * The title of the game.
   */
  title: string;

  /**
   * The developer of the game.
   */
  developer: User;

  /**
   * The timestamp when the game was published.
   */
  published_on: number;

  /**
   * The timestamp when the game was posted.
   */
  posted_on: number;

  /**
   * The number of followers the game has.
   */
  follower_count: number;

  /**
   * The TIGRS rating of the game.
   */
  tigrs: number;

  /**
   * The tool used to create the game.
   */
  creation_tool: string;

  /**
   * The human-readable name of the creation tool.
   */
  creation_tool_human: string;

  /**
   * The category of the game.
   */
  category: string;

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
