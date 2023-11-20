import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
  Message,
  escapeMarkdown,
} from "discord.js";

import { define } from "@mrwhale-io/commands";
import { truncate } from "@mrwhale-io/core";
import { DiscordCommand } from "../../client/command/discord-command";
import { EMBED_COLOR, MAX_EMBED_DESCRIPTION_LENGTH } from "../../constants";

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
    const embed = await this.getDefinitionEmbed(phrase);

    return message.reply({ embeds: [embed] });
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<InteractionResponse<boolean>> {
    const phrase = interaction.options.getString("phrase");
    const embed = await this.getDefinitionEmbed(phrase);

    return interaction.reply({ embeds: [embed] });
  }

  private async getDefinitionEmbed(phrase: string): Promise<EmbedBuilder> {
    const definition = truncate(
      MAX_EMBED_DESCRIPTION_LENGTH - 3,
      await define.action(phrase)
    );

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setDescription(escapeMarkdown(definition));

    return embed;
  }
}
