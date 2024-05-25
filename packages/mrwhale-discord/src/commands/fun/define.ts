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
import {
  EMBED_COLOR,
  MAX_EMBED_DESCRIPTION_LENGTH,
  MAX_EMBED_FIELD_VALUE_LENGTH,
} from "../../constants";
import {
  PageResult,
  getEmbedWithPaginatorButtons,
} from "../../util/button/paginator-buttons";

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

    return message.reply({ embeds: [embed[0]] });
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    const phrase = interaction.options.getString("phrase");
    const embeds = await this.getDefinitionEmbed(phrase);

    if (!Array.isArray(embeds)) {
      return interaction.reply({ embeds: [embeds] });
    }

    const fetchDefinitionsEmbed = async (page: number): Promise<PageResult> => {
      const embed = embeds[page].setFooter({
        text: `Page ${page}/${embeds.length - 1}`,
      });
      return { embed, pages: embeds.length - 1 };
    };

    return await getEmbedWithPaginatorButtons(
      interaction,
      fetchDefinitionsEmbed
    );
  }

  private async getDefinitionEmbed(
    phrase: string
  ): Promise<EmbedBuilder | EmbedBuilder[]> {
    const definitionResult = await define.action(phrase);

    if (typeof definitionResult === "string") {
      return new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setDescription(definitionResult);
    }

    const embeds: EmbedBuilder[] = [];
    for (const result of definitionResult) {
      const definition = truncate(
        MAX_EMBED_DESCRIPTION_LENGTH - 3,
        escapeMarkdown(result.definition)
      );
      const example = truncate(
        MAX_EMBED_FIELD_VALUE_LENGTH - 3,
        escapeMarkdown(result.example)
      );
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle(`Definition for ${result.word}`)
        .setDescription(definition);

      if (example) {
        embed.addFields([
          {
            name: "Example",
            value: example,
          },
        ]);
      }
      embeds.push(embed);
    }

    return embeds;
  }
}
