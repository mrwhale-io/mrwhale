import {
  APISelectMenuComponent,
  AnySelectMenuInteraction,
  BaseSelectMenuBuilder,
  ComponentType,
  SelectMenuType,
} from "discord.js";

import { DiscordSelectMenuOptions } from "../../types/menu/discord-select-menu-options";
import { Loadable } from "../../types/loadable";

export abstract class DiscordSelectMenu extends Loadable {
  /**
   * The type of discord select menu.
   */
  type: SelectMenuType;

  constructor(options: DiscordSelectMenuOptions) {
    super(options.name);
    this.type = options.type ?? ComponentType.StringSelect;
  }

  /**
   * The action to be run when a select menu option is selected.
   * @param interaction The interaction that invoked the menu.
   */
  abstract action(interaction: AnySelectMenuInteraction): Promise<unknown>;

  /**
   * Get an instance of the select menu builder.
   * @param userId The identifier of the discord user that requested the select menu.
   */
  getSelectMenuBuilder?(
    userId: string
  ): BaseSelectMenuBuilder<APISelectMenuComponent>;
}
