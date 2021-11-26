import {
  TimeUtilities,
  getCommandName,
  getCommandArgs,
  dispatch,
} from "@mrwhale-io/core";
import { Interaction, CommandInteraction, Message } from "discord.js";

import { DiscordBotClient } from "../discord-bot-client";
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

    this.bot.client.on("messageCreate", (message) => {
      this.handleMessage(message);
    });
  }

  private async handleMessage(message: Message) {
    if (message.author.id === this.bot.client.user.id || !this._ready) {
      return;
    }

    const prefix = await this.bot.getPrefix(message.guildId);

    if (!message.content.trim().startsWith(prefix)) {
      return;
    }

    const commandName = getCommandName(message.content, prefix);
    const command = this.bot.commands.findByNameOrAlias(commandName);

    if (!command) {
      return message.reply(
        `Unknown command. Use ${prefix}help to view the command list.`
      );
    }

    if (command.admin && message.author.id !== this.bot.ownerId) {
      return message.reply("This is an admin only command.");
    }

    if (!this.checkRateLimits(message, command)) {
      return;
    }

    const args = getCommandArgs(message.content, prefix, command.argSeparator);

    await dispatch(command, message, args).catch((e) =>
      this.bot.logger.error(e)
    );

    this.bot.logger.info(
      `${message.author.username} (${message.author.id}) ran command ${command.name}`
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

    await command
      .slashCommandAction(interaction)
      .catch((e) => this.bot.logger.error(e));

    this.bot.logger.info(
      `${interaction.user.username}#${interaction.user.discriminator} ran command ${command.name}`
    );
  }

  private checkRateLimits(
    interaction: CommandInteraction | Message,
    command: DiscordCommand
  ): boolean {
    const passed = this.checkRateLimiter(interaction, command);

    if (passed) {
      command.rateLimiter.get(interaction).call();
    }

    return passed;
  }

  private checkRateLimiter(
    interaction: CommandInteraction | Message,
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
