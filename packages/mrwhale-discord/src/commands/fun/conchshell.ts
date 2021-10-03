import { conchshell } from "@mrwhale-io/commands";
import { CommandInteraction } from "discord.js";

import { DiscordCommand } from "../../client/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(conchshell.data);
    this.slashCommandData.addStringOption((option) =>
      option
        .setName("question")
        .setDescription("Ask a question.")
        .setRequired(true)
    );
  }

  async action(interaction: CommandInteraction): Promise<void> {
    const question = interaction.options.get("question").value as string;
    const answer = conchshell.action(question);

    return interaction.reply(answer);
  }
}
