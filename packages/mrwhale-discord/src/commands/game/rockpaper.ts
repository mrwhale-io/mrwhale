import { ChatInputCommandInteraction, InteractionResponse, Message } from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "rockpaper",
      description: "Rock. Paper. Scissors.",
      type: "game",
      usage: "<prefix>rockpaper <rock|paper|scissors>",
      examples: ["<prefix>rockpaper scissors"],
      aliases: ["rps"],
    });
    this.slashCommandData.addStringOption((option) =>
      option
        .setName("choice")
        .setDescription("Rock. Paper. Scissors")
        .setRequired(true)
        .addChoices(
          { name: "Rock", value: "rock" },
          { name: "Paper", value: "paper" },
          { name: "Scissors", value: "scissors" }
        )
    );
  }

  private compare(first: string, second: string) {
    if (first === second) {
      return "It's a tie!";
    } else if (first === "scissors") {
      if (second === "paper") return "Scissors wins! :v:";
      else return "Rock wins! :fist:";
    } else if (first === "rock") {
      if (second === "scissors") return "Rock wins! :fist:";
      else return "Paper wins! :hand_splayed:";
    } else if (first === "paper") {
      if (second === "rock") return "Paper wins! :hand_splayed:";
      else return "Scissors wins! :v:";
    }
  }

  async action(message: Message, [choice]: [string]): Promise<Message> {
    if (!choice || choice === "") {
      return message.reply("Please pass a choice.");
    }

    const userChoice = choice.trim().toLowerCase();

    return message.reply(this.rockPaperScissors(userChoice));
  }

  slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<InteractionResponse<boolean>> {
    const choice = interaction.options.getString("choice");

    return interaction.reply(this.rockPaperScissors(choice));
  }

  private rockPaperScissors(choice: string): string {
    const compChoice = Math.random();
    let compChoiceStr = "";

    const validChoices = /\b(rock|paper|scissors)\b/;

    if (!choice.match(validChoices)) {
      return "Please pass rock, paper, scissors.";
    }

    if (compChoice < 0.34) {
      compChoiceStr = "Rock";
    } else if (compChoice <= 0.67) {
      compChoiceStr = "Paper";
    } else {
      compChoiceStr = "Scissors";
    }

    const result = this.compare(choice, compChoiceStr.toLowerCase());

    return `${compChoiceStr}. ${result}`;
  }
}
