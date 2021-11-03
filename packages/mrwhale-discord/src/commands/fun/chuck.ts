import { chuck } from "@mrwhale-io/commands";
import { CommandInteraction } from "discord.js";

import { DiscordCommand } from "../../client/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(chuck.data);
    this.slashCommandData.addStringOption((option) =>
      option.setName("firstname").setDescription("Custom first name.")
    );
    this.slashCommandData.addStringOption((option) =>
      option.setName("lastname").setDescription("Custom last name.")
    );
    this.slashCommandData.addStringOption((option) =>
      option.setName("category").setDescription("Joke category.")
    );
  }

  async action(interaction: CommandInteraction): Promise<void> {
    const firstName = interaction.options.getString("firstname");
    const lastName = interaction.options.getString("lastname");
    const category = interaction.options.getString("category");

    return interaction.reply(await chuck.action(firstName, lastName, category));
  }
}