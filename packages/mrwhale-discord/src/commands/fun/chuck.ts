import { chuck } from "@mrwhale-io/commands";
import { ChatInputCommandInteraction, InteractionResponse, Message } from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";

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

  async action(
    message: Message,
    [firstName, lastName, category]: [string, string, string]
  ): Promise<Message> {
    return message.reply(await chuck.action(firstName, lastName, category));
  }

  async slashCommandAction(interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean>> {
    const firstName = interaction.options.getString("firstname");
    const lastName = interaction.options.getString("lastname");
    const category = interaction.options.getString("category");

    return interaction.reply(await chuck.action(firstName, lastName, category));
  }
}
