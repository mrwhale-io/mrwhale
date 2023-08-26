import {
  TimeUtilities,
  getCommandName,
  getCommandArgs,
  dispatch,
  code,
} from "@mrwhale-io/core";
import {
  Interaction,
  ChatInputCommandInteraction,
  Message,
  TextChannel,
  User,
  ChannelType,
} from "discord.js";

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
    this.bot.client.on("interactionCreate", (interaction) => {
      this.handleInteraction(interaction);
    });

    this.bot.client.on("messageCreate", (message) => {
      this.handleMessage(message);
    });
  }

  private async handleMessage(message: Message) {
    if (message.author.bot || !this._ready) {
      return;
    }

    const dm = message.channel.type === ChannelType.DM;
    const prefix = await this.bot.getPrefix(message.guildId);

    if (!message.content.trim().startsWith(prefix)) {
      return;
    }

    const commandName = getCommandName(message.content, prefix);
    const command = this.bot.commands.findByNameOrAlias(commandName);

    if (!this.checkRateLimits(message, command)) {
      return;
    }

    let hasPermission = false;
    try {
      hasPermission = this.hasPermission(
        command,
        message.channel as TextChannel,
        message.author,
        dm
      );
    } catch (error) {
      return message.reply(error);
    }

    if (!hasPermission) {
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
    if (!interaction.isChatInputCommand() || !this._ready) {
      return;
    }

    const commandName = interaction.commandName.toLowerCase();
    const command = this.bot.commands.findByNameOrAlias(commandName);

    if (!this.checkRateLimits(interaction, command)) {
      return;
    }

    let hasPermission = false;
    try {
      hasPermission = this.hasPermission(
        command,
        interaction.channel as TextChannel,
        interaction.user,
        !interaction.inGuild()
      );
    } catch (error) {
      return interaction.reply(error);
    }

    if (!hasPermission) {
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
    interaction: ChatInputCommandInteraction | Message,
    command: DiscordCommand
  ): boolean {
    const passed = this.checkRateLimiter(interaction, command);

    if (passed) {
      command.rateLimiter.get(interaction).call();
    }

    return passed;
  }

  private checkRateLimiter(
    interaction: ChatInputCommandInteraction | Message,
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

  private hasPermission(
    command: DiscordCommand,
    channel: TextChannel,
    user: User,
    dm: boolean
  ): boolean {
    if (command.admin && !this.bot.isOwner(user)) {
      return false;
    }

    if (dm && command.guildOnly) {
      throw "This command is for servers only.";
    }

    const missingCallerPermissions = !dm
      ? channel.permissionsFor(user).missing(command.callerPermissions, false)
      : [];

    if (missingCallerPermissions.length > 0) {
      const error = `You are missing the following permissions: ${missingCallerPermissions
        .map((missing) => code(missing))
        .join(", ")}`;
      throw error;
    }

    const missingClientPermissions = !dm
      ? channel
          .permissionsFor(this.bot.client.user)
          .missing(command.clientPermissions, false)
      : [];

    if (missingClientPermissions.length > 0) {
      const error = `I am missing the following permissions: ${missingClientPermissions
        .map((missing) => code(missing))
        .join(", ")}`;
      channel.send(error);
      return false;
    }

    return true;
  }
}
