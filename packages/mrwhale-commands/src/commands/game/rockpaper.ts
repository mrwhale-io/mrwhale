import { CommandOptions, capitalise } from "@mrwhale-io/core";

enum Choices {
  Rock = "rock",
  Paper = "paper",
  Scissors = "scissors",
}

export const data: CommandOptions = {
  name: "rockpaper",
  description: "Play a game of Rock. Paper. Scissors.",
  type: "game",
  usage: "<prefix>rockpaper <rock|paper|scissors>",
  examples: ["<prefix>rockpaper scissors"],
  aliases: ["rps"],
};

export function action(choice: string): string {
  const validChoices = /\b(rock|paper|scissors)\b/;
  if (!choice || !choice.match(validChoices)) {
    return "Please pass a valid choice: rock, paper, or scissors.";
  }

  const userChoice = choice.trim().toLowerCase();
  const compChoice = getRandomChoice();
  const result = compare(userChoice, compChoice);

  return `${compChoice}. ${result}`;
}

function compare(first: string, second: string): string {
  if (first === second) {
    return "It's a tie!";
  }

  const choices: Record<string, string> = {
    [Choices.Rock]: Choices.Scissors,
    [Choices.Paper]: Choices.Rock,
    [Choices.Scissors]: Choices.Paper,
  };

  if (choices[first] === second) {
    return `${capitalise(first)} wins! ${getEmoji(first)}`;
  } else {
    return `${capitalise(second)} wins! ${getEmoji(second)}`;
  }
}

function getRandomChoice(): string {
  const choices = Object.values(Choices);
  return choices[Math.floor(Math.random() * choices.length)];
}

function getEmoji(choice: string): string {
  const emojis: Record<string, string> = {
    [Choices.Rock]: "👊",
    [Choices.Paper]: "✋",
    [Choices.Scissors]: "✌",
  };

  return emojis[choice];
}
