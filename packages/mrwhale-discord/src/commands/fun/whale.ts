import { whale } from "@mrwhale-io/commands";
import { CommandInteraction } from "discord.js";

import { DiscordCommand } from "../../client/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(whale.data);
    this.slashCommandData.addNumberOption((option) =>
      option.setName("size").setDescription("The size of the whale.")
    );
  }

  async action(interaction: CommandInteraction): Promise<void> {
    const size = interaction.options.getNumber("size");

    return interaction.reply(whale.action(size));
  }
}
