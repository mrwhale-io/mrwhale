import { define } from "@mrwhale-io/commands";
import { CommandInteraction } from "discord.js";

import { DiscordCommand } from "../../client/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(define.data);
    this.slashCommandData.addStringOption((option) =>
      option
        .setName("phrase")
        .setDescription("The phrase or word to lookup.")
        .setRequired(true)
    );
  }

  async action(interaction: CommandInteraction): Promise<void> {
    const question = interaction.options.getString("phrase");

    return interaction.reply(await define.action(question));
  }
}
