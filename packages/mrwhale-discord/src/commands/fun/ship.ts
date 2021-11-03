import { ship } from "@mrwhale-io/commands";
import { CommandInteraction } from "discord.js";

import { DiscordCommand } from "../../client/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(ship.data);
    this.slashCommandData.addMentionableOption((option) =>
      option
        .setName("first")
        .setDescription("The first user.")
        .setRequired(true)
    );
    this.slashCommandData.addMentionableOption((option) =>
      option
        .setName("second")
        .setDescription("The second user.")
        .setRequired(true)
    );
  }

  async action(interaction: CommandInteraction): Promise<void> {
    const first = interaction.options.getMentionable("first").toString();
    const second = interaction.options.getMentionable("second").toString();
    const result = ship.action(first, second);

    return interaction.reply(result);
  }
}
