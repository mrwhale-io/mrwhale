import { gameIdea } from "@mrwhale-io/commands";
import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super({
      ...gameIdea.data,
      usage: "<prefix>gameidea [simple|detailed]",
      description: "Generate a random game idea with intelligent combinations.",
    });
    this.slashCommandData.addStringOption((option) =>
      option
        .setName("mode")
        .setDescription("Generation mode for the game idea.")
        .addChoices(
          { name: "Simple", value: "simple" },
          { name: "Detailed", value: "detailed" },
        )
        .setRequired(false),
    );
  }

  async action(message: Message, args: string[]): Promise<Message> {
    const formattedIdea = gameIdea.action(args);
    return message.reply(formattedIdea);
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction,
  ): Promise<InteractionResponse<boolean>> {
    const mode = interaction.options.getString("mode");
    const args = mode ? [mode] : [];

    const formattedIdea = gameIdea.action(args);
    return interaction.reply(formattedIdea);
  }
}
