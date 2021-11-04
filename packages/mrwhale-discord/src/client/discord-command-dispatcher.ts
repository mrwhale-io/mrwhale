import { TimeUtilities, dispatch } from "@mrwhale-io/core";
import { Interaction, CommandInteraction } from "discord.js";

import { DiscordBotClient } from "./discord-bot-client";
import { DiscordCommand } from "./discord-command";

/**
 * Responsible for dispatching discord commands.
 */
export class DiscordCommandDispatcher {
  private _ready = false;

  /**
   * Set whether the command dispatcher is ready.F
   */
  set ready(value: boolean) {
    this._ready = value;
  }

  readonly bot: DiscordBotClient;

  constructor(bot: DiscordBotClient) {
    this.bot = bot;
    this.bot.client.on("interactionCreate", (interaction) =>
      this.handleInteraction(interaction)
    );
  }

  private async handleInteraction(interaction: Interaction) {
    if (!interaction.isCommand() || !this._ready) {
      return;
    }

    const commandName = interaction.commandName.toLowerCase();
    const command = this.bot.commands.findByNameOrAlias(commandName);

    if (!this.checkRateLimits(interaction, command)) {
      return;
    }

    await dispatch(command, interaction).catch((e) => this.bot.logger.error(e));

    this.bot.logger.info(
      `${interaction.user.username}#${interaction.user.discriminator} ran command ${command.name}`
    );
  }

  private checkRateLimits(
    interaction: CommandInteraction,
    command: DiscordCommand
  ): boolean {
    const passed = this.checkRateLimiter(interaction, command);

    if (passed) {
      command.rateLimiter.get(interaction).call();
    }

    return passed;
  }

  private checkRateLimiter(
    interaction: CommandInteraction,
    command: DiscordCommand
  ): boolean {
    const rateLimiter = command.rateLimiter;
    const rateLimit = rateLimiter.get(interaction);

    if (!rateLimit.isRateLimited) {
      return true;
    }

    if (!rateLimit.wasNotified) {
      rateLimit.setNotified();
      const timeLeft = TimeUtilities.difference(
        rateLimit.expires,
        Date.now()
      ).toString();

      if (timeLeft) {
        interaction.reply(`Command cooldown. Try again in ${timeLeft}.`);
      }
    }

    return false;
  }
}
