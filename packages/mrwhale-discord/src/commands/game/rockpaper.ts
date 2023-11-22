import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from "discord.js";

import { rockpaper } from "@mrwhale-io/commands";
import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(rockpaper.data);
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

  async action(message: Message, [choice]: [string]): Promise<Message> {
    return message.reply(rockpaper.action(choice));
  }

  slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<InteractionResponse<boolean>> {
    const choice = interaction.options.getString("choice");

    return interaction.reply(rockpaper.action(choice));
  }
}
