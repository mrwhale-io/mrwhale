import { roll } from "@mrwhale-io/commands";
import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(roll.data);
    this.slashCommandData.addStringOption((option) =>
      option.setName("dice").setDescription("The dice to roll.")
    );
  }

  async action(message: Message, args: string[]): Promise<Message> {
    return message.reply(roll.action(args));
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<InteractionResponse<boolean>> {
    const dice = interaction.options.getString("dice");

    return interaction.reply(roll.action([dice]));
  }
}
