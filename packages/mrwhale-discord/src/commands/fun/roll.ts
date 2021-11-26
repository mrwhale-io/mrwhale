import { roll } from "@mrwhale-io/commands";
import { CommandInteraction, Message } from "discord.js";

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

  async slashCommandAction(interaction: CommandInteraction): Promise<void> {
    const dice = interaction.options.getString("dice");

    return interaction.reply(roll.action([dice]));
  }
}
