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
      option
        .setName("dice")
        .setDescription("The number of dice to roll.")
        .setRequired(true)
    );
    this.slashCommandData.addStringOption((option) =>
      option
        .setName("sides")
        .setDescription("The number of dice to roll.")
        .setRequired(true)
        .addChoices(
          { name: "d4", value: "d4" },
          { name: "d6", value: "d6" },
          { name: "d8", value: "d8" },
          { name: "d10", value: "d10" },
          { name: "d12", value: "d12" },
          { name: "d20", value: "d20" }
        )
    );
  }

  async action(message: Message, args: string[]): Promise<Message> {
    return message.reply(roll.action(args));
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<InteractionResponse<boolean>> {
    const dice = interaction.options.getString("dice");
    const sides = interaction.options.getString("sides");

    return interaction.reply(roll.action([`${dice} ${sides}`]));
  }
}
