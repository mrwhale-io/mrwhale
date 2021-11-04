import { roll } from "@mrwhale-io/commands";
import { CommandInteraction } from "discord.js";

import { DiscordCommand } from "../../client/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(roll.data);
    this.slashCommandData.addStringOption((option) =>
      option.setName("dice").setDescription("The dice to roll.")
    );
  }

  async action(interaction: CommandInteraction): Promise<void> {
    const dice = interaction.options.getString("dice");

    return interaction.reply(roll.action([dice]));
  }
}
