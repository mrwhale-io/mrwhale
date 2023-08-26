import { define } from "@mrwhale-io/commands";
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
  Message
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import { EMBED_COLOR } from "../../constants";

export default class extends DiscordCommand {
  constructor() {
    super(define.data);
    this.slashCommandData.addStringOption((option) =>
      option
        .setName("phrase")
        .setDescription("The phrase or word to lookup.")
        .setRequired(true)
    );
  }

  async action(message: Message, [phrase]: [string]): Promise<Message> {
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setDescription(await define.action(phrase));

    return message.reply({ embeds: [embed] });
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<InteractionResponse<boolean>> {
    const question = interaction.options.getString("phrase");
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setDescription(await define.action(question));

    return interaction.reply({ embeds: [embed] });
  }
}
