import { MinesweeperGame } from "../types/minesweeper-game";
import {
  minesweeperEasy,
  minesweeperHard,
  minesweeperMedium,
} from "../data/minesweeper";

/**
 * A helper for setting up a new minesweeper game.
 * @param authorId The author of the game.
 * @param difficulty The difficulty of the game.
 */
export function createMinesweeperGame(
  authorId: string,
  difficulty: string
): MinesweeperGame {
  switch (difficulty) {
    case "easy":
      return new MinesweeperGame(minesweeperEasy, authorId);
    case "medium":
      return new MinesweeperGame(minesweeperMedium, authorId);
    case "hard":
      return new MinesweeperGame(minesweeperHard, authorId);
  }

  return new MinesweeperGame(minesweeperMedium, authorId);
}
