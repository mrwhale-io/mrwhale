import { wolfram } from "@mrwhale-io/commands";
import { CommandInteraction, Message } from "discord.js";

import * as config from "../../../config.json";
import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(wolfram.data);
    this.slashCommandData.addStringOption((option) =>
      option
        .setName("query")
        .setDescription("The query terms.")
        .setRequired(true)
    );
  }

  async action(message: Message, [query]: [string]): Promise<Message> {
    return message.reply(await wolfram.action(query, config.wolfram));
  }

  async slashCommandAction(interaction: CommandInteraction): Promise<void> {
    const query = interaction.options.getString("query");

    return interaction.reply(await wolfram.action(query, config.wolfram));
  }
}
