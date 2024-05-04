import { ButtonInteraction, Events, Interaction } from "discord.js";

import { TimeUtilities } from "@mrwhale-io/core";
import { DiscordBotClient } from "../discord-bot-client";
import { DiscordButton } from "./discord-button";

/**
 * Responsible for handling discord buttons.
 */
export class DiscordButtonHandler {
  private _ready = false;

  set ready(value: boolean) {
    this._ready = value;
  }

  readonly bot: DiscordBotClient;

  constructor(bot: DiscordBotClient) {
    this.bot = bot;
    this.bot.client.on(Events.InteractionCreate, (interaction) => {
      this.handleButton(interaction);
    });
  }

  private async handleButton(interaction: Interaction) {
    if (!interaction.isButton() || !this._ready) {
      return;
    }

    const userId = interaction.user.id;
    const customId = interaction.customId.replace(/\d/g, "");
    const button = this.bot.buttons.get(customId);

    if (!button) {
      return;
    }

    const authorId = interaction.customId.replace(/^\D+/g, "");
    if (authorId && authorId !== userId) {
      return await interaction.reply({
        content: "You cannot select this button.",
        ephemeral: true,
      });
    }

    if (!this.checkRateLimits(interaction, button)) {
      return;
    }

    await button.action(interaction).catch((e) => this.bot.logger.error(e));
  }

  private checkRateLimits(
    interaction: ButtonInteraction,
    button: DiscordButton
  ): boolean {
    const passed = this.checkRateLimiter(interaction, button);

    if (passed) {
      button.rateLimiter.get(interaction).call();
    }

    return passed;
  }

  private checkRateLimiter(
    interaction: ButtonInteraction,
    command: DiscordButton
  ): boolean {
    const rateLimiter = command.rateLimiter;
    const rateLimit = rateLimiter.get(interaction);

    if (!rateLimit.isRateLimited) {
      return true;
    }

    const timeLeft = TimeUtilities.difference(rateLimit.expires, Date.now())
      .toString()
      .trim();

    const cooldownMessage = `Button cooldown. Try again${
      timeLeft ? ` in ${timeLeft}` : ""
    }.`;

    interaction.reply({
      content: cooldownMessage,
      ephemeral: true,
    });

    return false;
  }
}
