import { wiki } from "@mrwhale-io/commands";
import { CommandInteraction } from "discord.js";

import { DiscordCommand } from "../../client/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(wiki.data);
    this.slashCommandData.addStringOption((option) =>
      option
        .setName("query")
        .setDescription("The query terms.")
        .setRequired(true)
    );
  }

  async action(interaction: CommandInteraction): Promise<void> {
    const query = interaction.options.getString("query");

    return interaction.reply(await wiki.action(query));
  }
}
