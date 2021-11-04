import { calculate } from "@mrwhale-io/commands";
import { CommandInteraction } from "discord.js";

import { DiscordCommand } from "../../client/discord-command";

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

  async action(interaction: CommandInteraction): Promise<void> {
    const expression = interaction.options.getString("expression");

    return interaction.reply(calculate.action(expression));
  }
}
