import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Message,
  InteractionResponse,
  StringSelectMenuBuilder,
  AutocompleteInteraction,
  CacheType,
  ApplicationCommandOptionChoiceData,
} from "discord.js";

import { TimeUtilities, capitalise } from "@mrwhale-io/core";
import { DiscordCommand } from "../../client/command/discord-command";
import { EMBED_COLOR } from "../../constants";
import { SelectMenus } from "../../types/select-menus";
import { getCommandsByTypeEmbed } from "../../util/help";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "help",
      description: "Get detailed information about commands and their usage.",
      type: "utility",
      usage: "<prefix>help <type|cmd>",
      cooldown: 5000,
    });
    this.slashCommandData.addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name of the command.")
        .setRequired(false)
        .setAutocomplete(true)
    );
  }

  async action(
    message: Message,
    [name]: [string]
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    const prefix = await this.botClient.getPrefix(message.guildId);
    if (name) {
      return this.getHelpInfo(message, name, prefix);
    }

    const commandTypesMenu = this.botClient.menus.get(SelectMenus.CommandTypes);
    const commandTypesMenuBuilder = commandTypesMenu.getSelectMenuBuilder(
      message.author.id
    ) as StringSelectMenuBuilder;
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      commandTypesMenuBuilder
    );
    const embed = await getCommandsByTypeEmbed("fun", this.botClient);

    return await message.reply({
      embeds: [embed],
      components: [row],
    });
  }

  async autocomplete(interaction: AutocompleteInteraction<CacheType>) {
    const focusedValue = interaction.options.getFocused();
    if (!focusedValue) {
      return await interaction.respond([]);
    }
    const commands = this.getCommandOptions();
    const filtered = commands.filter((choice) =>
      choice.name.toLowerCase().startsWith(focusedValue.toLowerCase())
    );
    await interaction.respond(filtered);
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    const name = interaction.options.getString("name");

    if (name) {
      return this.getHelpInfo(interaction, name);
    }

    const commandTypesMenu = this.botClient.menus.get(SelectMenus.CommandTypes);
    const commandTypesMenuBuilder = commandTypesMenu.getSelectMenuBuilder(
      interaction.user.id
    ) as StringSelectMenuBuilder;
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      commandTypesMenuBuilder
    );
    const embed = await getCommandsByTypeEmbed("fun", this.botClient);

    return await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  }

  private async getHelpInfo(
    message: Message | ChatInputCommandInteraction,
    name: string,
    prefix: string = "/"
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    if (prefix.length > 1) {
      prefix = prefix + " ";
    }

    const cmd = this.botClient.commands.findByNameOrAlias(
      name.toLowerCase().trim()
    );

    if (!cmd) {
      return message.reply("Could not find this command.");
    }

    const info = new EmbedBuilder().setColor(EMBED_COLOR).addFields([
      { name: "Name", value: cmd.name },
      { name: "Description", value: cmd.description },
      { name: "Type", value: capitalise(cmd.type) },
      {
        name: "Cooldown",
        value: `${TimeUtilities.convertMs(cmd.rateLimiter.duration)}`,
      },
    ]);

    if (cmd.examples.length > 0) {
      info.addFields([
        {
          name: "Examples",
          value: `${cmd.examples.join(", ").replace(/<prefix>/g, prefix)}`,
        },
      ]);
    }

    if (cmd.aliases.length > 0) {
      info.addFields([
        {
          name: "Aliases",
          value: `${cmd.aliases.join(", ")}`,
        },
      ]);
    }

    return message.reply({ embeds: [info] });
  }

  private getCommandOptions(): ApplicationCommandOptionChoiceData[] {
    return this.botClient.commands.map((cmd) => ({
      name: cmd.name,
      value: cmd.name,
    }));
  }
}
