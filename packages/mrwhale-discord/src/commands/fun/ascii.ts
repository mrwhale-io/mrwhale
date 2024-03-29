import { ascii } from "@mrwhale-io/commands";
import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(ascii.data);
    this.slashCommandData.addStringOption((option) =>
      option
        .setName("text")
        .setDescription("The text to convert to ascii.")
        .setMaxLength(ascii.MAX_ASCII_LENGTH)
        .setRequired(true)
    );
  }

  async action(message: Message, [text]: [string]): Promise<Message> {
    return message.reply(await ascii.action(text));
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<InteractionResponse<boolean>> {
    const text = interaction.options.getString("text");

    return interaction.reply(await ascii.action(text));
  }
}
