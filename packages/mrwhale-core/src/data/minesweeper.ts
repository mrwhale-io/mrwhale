import { MinesweeperOptions } from "../types/minesweeper-options";

export const minesweeperLostMessages = [
  "And you lost your head in the process. Tough luck mate!",
  "You failed your country!",
  "It took 40 days to clean up the mess.",
  "Pizza tastes good. Too bad you lost your tongue... somehow.",
  "*Dolphin noises*",
];

export const minesweeperWonMessages = [
  "A winner is you!",
  "And you only lost one arm!",
  "Get some beer!",
  "Momma be proud of you",
];

export const minesweeperEasy: MinesweeperOptions = {
  gridXSize: 10,
  gridYSize: 10,
  bombCount: 10,
  gameDuration: 360,
};

export const minesweeperMedium: MinesweeperOptions = {
  gridXSize: 15,
  gridYSize: 15,
  bombCount: 20,
  gameDuration: 600,
};

export const minesweeperHard: MinesweeperOptions = {
  gridXSize: 20,
  gridYSize: 20,
  bombCount: 35,
  gameDuration: 900,
};

export const minesweeperErrorMessages = {
  invalidCoordinate: (prefix: string, command: string) =>
    `Please provide a valid coordinate. (\`${
      prefix + command
    } <number> <letter>\`) \n` + `ex: \`${prefix + command} 15 c\``,
  coordinateOutOfRange: () =>
    "Please provide a valid coordinate. The coordinate you passed in is not on the board!",
  alreadyFlaggedTile: () =>
    "That tile is flagged! No revealing a flagged tile!",
  alreadyRevealed: () => "That tile is already revealed!",
  noGameRunning: () => "No game of minesweeper is underway.",
  cantEndGame: () => "You can't end the game when no game is running.",
  notGameOwner: () => "You have to be the game starter to end the game!",
  gameAlreadyRunning: (prefix: string) =>
    `A game of minesweeper has already started! Use \`${prefix}help minesweeper\` for more info.`,
  timedOut: () => "Time's up!",
  timedOutStartingNewGame: () => "Last game is timed out! Starting new game...",
};
