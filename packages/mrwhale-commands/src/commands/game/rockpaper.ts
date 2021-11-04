import { CommandOptions } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "rockpaper",
  description: "Rock. Paper. Scissors.",
  type: "game",
  usage: "<prefix>rockpaper <rock|paper|scissors>",
  examples: ["<prefix>rockpaper scissors"],
  aliases: ["rps"],
};

function compare(first: string, second: string) {
  if (first === second) {
    return "It's a tie!";
  } else if (first === "scissors") {
    if (second === "paper") return "Scissors wins! ✌";
    else return "Rock wins! 👊";
  } else if (first === "rock") {
    if (second === "scissors") return "Rock wins! 👊";
    else return "Paper wins! ✋";
  } else if (first === "paper") {
    if (second === "rock") return "Paper wins! ✋";
    else return "Scissors wins! ✌";
  }
}

export function action(choice: string): string {
  const validChoices = /\b(rock|paper|scissors)\b/;
  if (!choice || choice === "" || choice.match(validChoices)) {
    return "Please pass rock, paper, scissors.";
  }

  const userChoice = choice.trim().toLowerCase();
  const compChoice = Math.random();
  let compChoiceStr = "";

  if (compChoice < 0.34) {
    compChoiceStr = "rock";
  } else if (compChoice <= 0.67) {
    compChoiceStr = "paper";
  } else {
    compChoiceStr = "scissors";
  }

  const result = compare(userChoice, compChoiceStr);

  return `${compChoiceStr}. ${result}`;
}
