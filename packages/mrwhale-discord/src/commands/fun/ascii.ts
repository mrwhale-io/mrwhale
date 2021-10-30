import { ascii } from "@mrwhale-io/commands";
import { CommandInteraction } from "discord.js";

import { DiscordCommand } from "../../client/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(ascii.data);
    this.slashCommandData.addStringOption((option) =>
    option
      .setName("text")
      .setDescription("The text to convert to ascii.")
      .setRequired(true)
  );
  }

  async action(interaction: CommandInteraction): Promise<void> {
    const text = interaction.options.getString("text");

    return interaction.reply(await ascii.action(text));
  }
}
