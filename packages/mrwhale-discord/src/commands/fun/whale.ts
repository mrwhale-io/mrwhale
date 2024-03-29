import { whale } from "@mrwhale-io/commands";
import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(whale.data);
    this.slashCommandData.addNumberOption((option) =>
      option.setName("size").setDescription("The size of the whale.")
    );
  }

  async action(message: Message, [size]: [string]): Promise<Message> {
    let whaleSize = 5;

    if (size) {
      const radix = 10;
      const parsedSize = parseInt(size, radix);

      if (!isNaN(parsedSize)) {
        whaleSize = parsedSize;
      }
    }

    return message.reply(whale.action(whaleSize));
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<InteractionResponse<boolean>> {
    const size = interaction.options.getNumber("size");

    return interaction.reply(whale.action(size));
  }
}
