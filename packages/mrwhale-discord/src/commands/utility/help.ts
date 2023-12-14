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

import {
  TimeUtilities,
  unorderedList,
  code,
  capitalise,
  CommandTypes,
} from "@mrwhale-io/core";
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

  async action(message: Message, [typeOrCmdName]: [string]): Promise<void> {
    const prefix = await this.botClient.getPrefix(message.guildId);
    this.getHelpInfo(message, typeOrCmdName, prefix);
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

  async slashCommandAction(interaction: ChatInputCommandInteraction) {
    const name = interaction.options.getString("name");

    if (name) {
      this.getHelpInfo(interaction, name, "/");
    }

    const commandTypesMenu = this.botClient.menus.get(SelectMenus.CommandTypes);
    const commandTypesMenuBuilder = commandTypesMenu.getSelectMenuBuilder() as StringSelectMenuBuilder;
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
    typeOrCmdName: string,
    prefix: string
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    const types = ["fun", "utility", "useful", "level", "game", "image"];
    if (prefix.length > 1) {
      prefix = prefix + " ";
    }
    if (typeOrCmdName) {
      const cmd = this.botClient.commands.findByNameOrAlias(typeOrCmdName);

      if (cmd) {
        const info = new EmbedBuilder().setColor(EMBED_COLOR).addFields([
          { name: "Name", value: cmd.name },
          { name: "Description", value: cmd.description },
          { name: "Type", value: cmd.type },
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

      if (types.includes(typeOrCmdName.toLowerCase())) {
        const commands = this.botClient.commands.findByType(typeOrCmdName);

        return message.reply(
          unorderedList(
            commands.map(
              (command) =>
                `${code(prefix + command.name)} - ${command.description}`
            )
          )
        );
      }

      return message.reply("Could not find this command or type.");
    }

    return message.reply(
      unorderedList(types.map((type) => `${prefix}help ${type}`))
    );
  }

  private getCommandOptions(): ApplicationCommandOptionChoiceData[] {
    return this.botClient.commands.map((cmd) => ({
      name: capitalise(cmd.name),
      value: cmd.name,
    }));
  }
}
