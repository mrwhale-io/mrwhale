import { translate } from "@mrwhale-io/commands";
import { CommandInteraction } from "discord.js";

import { DiscordCommand } from "../../client/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(translate.data);
    this.slashCommandData
      .addStringOption((option) =>
        option
          .setName("phrase")
          .setDescription("The phrase to translate.")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("lang")
          .setDescription("The language to translate to.")
          .setRequired(true)
      );
  }

  async action(interaction: CommandInteraction): Promise<void> {
    const phrase = interaction.options.getString("phrase");
    const lang = interaction.options.getString("lang");

    return interaction.reply(await translate.action(phrase, lang));
  }
}
