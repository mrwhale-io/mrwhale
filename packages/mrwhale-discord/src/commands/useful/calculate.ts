import { calculate } from "@mrwhale-io/commands";
import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(calculate.data);
    this.slashCommandData.addStringOption((option) =>
      option
        .setName("expression")
        .setDescription("The expression to evaluate.")
        .setRequired(true)
    );
  }

  async action(message: Message, [expression]: [string]): Promise<Message> {
    return message.reply(calculate.action(expression));
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<InteractionResponse<boolean>> {
    const expression = interaction.options.getString("expression");

    return interaction.reply(calculate.action(expression));
  }
}
