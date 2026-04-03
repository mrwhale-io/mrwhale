import {
  Message,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
} from "discord.js";

import { COMMAND_TYPE_NAMES, CommandTypes, capitalise } from "@mrwhale-io/core";
import { DiscordSelectMenu } from "../client/menu/discord-select-menu";
import { SelectMenus } from "../types/menu/select-menus";
import { getCommandsByTypeEmbed } from "../util/embed/help-embed-helpers";

export default class extends DiscordSelectMenu {
  constructor() {
    super({
      name: SelectMenus.CommandTypes,
    });
  }

  async action(
    interaction: StringSelectMenuInteraction,
  ): Promise<Message<boolean>> {
    const embed = await getCommandsByTypeEmbed(
      interaction.values[0],
      this.botClient,
    );

    interaction.deferUpdate();

    return await interaction.message.edit({ embeds: [embed] });
  }

  getSelectMenuBuilder(id: string): StringSelectMenuBuilder {
    const selectCategoryMenu = new StringSelectMenuBuilder()
      .setCustomId(`${this.name}${id}`)
      .setPlaceholder("Make a selection")
      .setMinValues(1)
      .setMaxValues(1);

    for (const category of COMMAND_TYPE_NAMES) {
      selectCategoryMenu.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(capitalise(category))
          .setValue(category)
          .setEmoji(this.getEmoji(category)),
      );
    }

    return selectCategoryMenu;
  }

  private getEmoji(commandType: CommandTypes): string {
    const emojis: Record<CommandTypes, string> = {
      ["admin"]: "🛡️",
      ["economy"]: "💵",
      ["fishing"]: "🎣",
      ["fun"]: "😀",
      ["utility"]: "🔧",
      ["useful"]: "🖨️",
      ["game"]: "🎲",
      ["image"]: "🖼️",
      ["level"]: "🏆",
    };

    return emojis[commandType];
  }
}
