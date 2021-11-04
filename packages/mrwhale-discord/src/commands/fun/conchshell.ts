import { conchshell } from "@mrwhale-io/commands";
import { CommandInteraction } from "discord.js";

import { DiscordCommand } from "../../client/discord-command";

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

  async action(interaction: CommandInteraction): Promise<void> {
    const question = interaction.options.getString("question");

    return interaction.reply(conchshell.action(question));
  }
}
