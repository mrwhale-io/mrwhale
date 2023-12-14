import {
  APISelectMenuComponent,
  AnySelectMenuInteraction,
  BaseSelectMenuBuilder,
  ComponentType,
  SelectMenuType,
} from "discord.js";

import { DiscordSelectMenuOptions } from "../../types/discord-select-menu-options";
import { DiscordBotClient } from "../discord-bot-client";

export abstract class DiscordSelectMenu {
  /**
   * The name of the discord select menu.
   */
  name: string;

  /**
   * The type of discord select menu.
   */
  type: SelectMenuType;

  /**
   * An instance of the current discord bot client.
   */
  protected botClient: DiscordBotClient;

  constructor(options: DiscordSelectMenuOptions) {
    this.name = options.name;
    this.type = options.type ?? ComponentType.StringSelect;
  }

  /**
   * The action to be run when a select menu option is selected.
   * @param interaction The interaction that invoked the menu.
   */
  abstract action(interaction: AnySelectMenuInteraction): Promise<unknown>;

  /**
   * Registers a new instance of this command
   * @param client The bot instance.
   */
  register(client: DiscordBotClient): void {
    this.botClient = client;
    if (!this.name) {
      throw new Error(`Select menu must have a name.`);
    }
  }

  /**
   * Get an instance of the select menu builder.
   */
  getSelectMenuBuilder?(): BaseSelectMenuBuilder<APISelectMenuComponent>;
}
