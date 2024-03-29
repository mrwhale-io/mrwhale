import { Events, Interaction } from "discord.js";

import { DiscordBotClient } from "../discord-bot-client";

/**
 * Responsible for handling discord select menus.
 */
export class DiscordSelectMenuHandler {
  private _ready = false;

  /**
   * Set whether the discord select menu dispatcher is ready.
   */
  set ready(value: boolean) {
    this._ready = value;
  }

  readonly bot: DiscordBotClient;

  constructor(bot: DiscordBotClient) {
    this.bot = bot;
    this.bot.client.on(Events.InteractionCreate, (interaction) => {
      this.handleSelectMenu(interaction);
    });
  }

  private async handleSelectMenu(interaction: Interaction) {
    if (!interaction.isAnySelectMenu() || !this._ready) {
      return;
    }

    const userId = interaction.user.id;
    const customId = interaction.customId.replace(userId, "");
    const selectMenu = this.bot.menus.get(customId);

    if (!selectMenu) {
      return await interaction.reply({
        content: "You cannot select this menu option.",
        ephemeral: true,
      });
    }

    await selectMenu.action(interaction).catch((e) => this.bot.logger.error(e));
  }
}
