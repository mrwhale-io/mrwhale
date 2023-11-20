import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
  Message,
} from "discord.js";

import { translate } from "@mrwhale-io/commands";
import { DiscordCommand } from "../../client/command/discord-command";
import { EMBED_COLOR, MAX_EMBED_FIELD_VALUE_LENGTH } from "../../constants";

export default class extends DiscordCommand {
  constructor() {
    super(translate.data);
    this.slashCommandData
      .addStringOption((option) =>
        option
          .setName("phrase")
          .setDescription("The phrase to translate.")
          .setRequired(true)
          .setMaxLength(MAX_EMBED_FIELD_VALUE_LENGTH)
      )
      .addStringOption((option) =>
        option
          .setName("lang")
          .setDescription("The language to translate to.")
          .setRequired(true)
          .setAutocomplete(true)
      );
  }

  async action(
    message: Message,
    [lang, ...text]: [string, string[]]
  ): Promise<Message> {
    const toTranslate = text.join();

    if (!toTranslate) {
      return message.reply("Please pass some text to translate.");
    }

    const translated = await translate.action(toTranslate, lang);

    return message.reply(translated);
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<InteractionResponse<boolean>> {
    const phrase = interaction.options.getString("phrase");
    const lang = interaction.options.getString("lang");

    const translated = await translate.action(phrase, lang);
    const embed = this.setupEmbed(phrase, translated, lang);

    return interaction.reply({ embeds: [embed] });
  }

  async autocomplete(interaction: AutocompleteInteraction<CacheType>) {
    const focusedValue = interaction.options.getFocused();
    if (!focusedValue) {
      return await interaction.respond([]);
    }
    const choices = this.getLanguageOptions();
    const filtered = choices.filter((choice) =>
      choice.name.toLowerCase().startsWith(focusedValue.toLowerCase())
    );
    await interaction.respond(filtered);
  }

  private getLanguageOptions(): ApplicationCommandOptionChoiceData[] {
    const langs = translate.languages();
    const EXCLUDED_LANGS = ["isSupported", "getCode"];

    return Object.entries(langs)
      .map(([value, name]) => ({
        name,
        value,
      }))
      .filter((lang) => !EXCLUDED_LANGS.includes(lang.value));
  }

  private setupEmbed(
    sourceText: string,
    translatedText: string,
    sourceLanguage: string
  ): EmbedBuilder {
    const languages = translate.languages();
    return new EmbedBuilder()
      .setTitle("Translation")
      .setColor(EMBED_COLOR)
      .addFields([
        {
          name: "Source language",
          value: languages[sourceLanguage],
        },
        {
          name: "Source text",
          value: sourceText,
        },
      ])
      .setDescription(translatedText);
  }
}
