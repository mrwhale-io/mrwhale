import { TimeUtilities, Command } from "@mrwhale-io/core";
import { Interaction, CommandInteraction, Client } from "discord.js";

import { DiscordBotClient } from "./discord-bot-client";
import { DiscordCommand } from "./discord-command";

/**
 * Responsible for dispatching discord commands.
 */
export class DiscordCommandDispatcher {
  private _ready = false;

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
    const command = this.bot.commands.find(
      (cmd) => cmd.name.toLowerCase() === commandName
    ) as DiscordCommand;

    if (!this.checkRateLimits(interaction, command)) {
      return;
    }

    await this.dispatch(command, interaction).catch((e) =>
      this.bot.logger.error(e)
    );

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

  private async dispatch(
    command: Command<Client>,
    interaction: CommandInteraction
  ) {
    return new Promise((resolve, reject) => {
      try {
        const action = command.action(interaction);
        if (action instanceof Promise) {
          action.then(resolve).catch(reject);
        } else resolve(action);
      } catch (err) {
        reject(err);
      }
    });
  }
}
