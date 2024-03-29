import { conchshell } from "@mrwhale-io/commands";
import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(conchshell.data);
    this.slashCommandData.addStringOption((option) =>
      option
        .setName("question")
        .setDescription("The question to ask.")
        .setRequired(true)
    );
  }

  async action(message: Message, [question]: [string]): Promise<Message> {
    return message.reply(conchshell.action(question));
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<InteractionResponse<boolean>> {
    const question = interaction.options.getString("question");

    return interaction.reply(conchshell.action(question));
  }
}
