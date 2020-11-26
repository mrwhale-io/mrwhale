import { Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "rockpaper",
      description: "Rock. Paper. Scissors.",
      type: "game",
      usage: "<prefix>rockpaper <rock|paper|scissors>",
      examples: ["<prefix>rockpaper scissors"],
      aliases: ["rps"],
    });
  }

  private compare(first: string, second: string) {
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

  async action(message: Message, [choice]: [string]) {
    if (!choice || choice === "") {
      return message.reply("Please pass a choice.");
    }

    const userChoice = choice.trim().toLowerCase();
    const compChoice = Math.random();
    let compChoiceStr = "";

    const validChoices = /\b(rock|paper|scissors)\b/;

    if (!message.textContent.match(validChoices)) {
      return message.reply("Please pass rock, paper, scissors.");
    }

    if (compChoice < 0.34) {
      compChoiceStr = "rock";
    } else if (compChoice <= 0.67) {
      compChoiceStr = "paper";
    } else {
      compChoiceStr = "scissors";
    }

    const result = this.compare(userChoice, compChoiceStr);

    return message.reply(`${compChoiceStr}. ${result}`);
  }
}
