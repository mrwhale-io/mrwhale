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
  Events,
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
    this.bot.client.on(Events.InteractionCreate, (interaction) => {
      this.handleInteraction(interaction);
      this.handleAutocomplete(interaction);
    });

    this.bot.client.on(Events.MessageCreate, (message) => {
      this.handleMessage(message);
    });
  }

  private async handleMessage(message: Message) {
    if (message.author.bot || !this._ready) {
      return;
    }

    const guildId = message.guildId;
    const dm = message.channel.type === ChannelType.DM;
    const prefix = await this.bot.getPrefix(guildId);

    if (!message.content.trim().startsWith(prefix)) {
      return;
    }

    const commandName = getCommandName(message.content, prefix);
    const command = this.bot.commands.findByNameOrAlias(commandName);

    if (!command) {
      return;
    }

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

    // Check if the settings for the guild are loaded
    if (guildId && !this.bot.guildSettings.has(guildId)) {
      await this.bot.loadGuildSettings(guildId);
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
      return interaction.reply({ content: error, ephemeral: true });
    }

    if (!hasPermission) {
      return;
    }

    const guildId = interaction.guildId;

    // Check if the settings for the guild are loaded
    if (guildId && !this.bot.guildSettings.has(guildId)) {
      await this.bot.loadGuildSettings(guildId);
    }

    await command
      .slashCommandAction(interaction)
      .catch((e) => this.bot.logger.error(e));

    this.bot.logger.info(
      `${interaction.user.username}#${interaction.user.discriminator} ran command ${command.name}`
    );
  }

  private async handleAutocomplete(interaction: Interaction) {
    if (!interaction.isAutocomplete() || !this._ready) {
      return;
    }
    const commandName = interaction.commandName.toLowerCase();
    const command = this.bot.commands.findByNameOrAlias(commandName);

    const guildId = interaction.guildId;

    // Check if the settings for the guild are loaded
    if (guildId && !this.bot.guildSettings.has(guildId)) {
      await this.bot.loadGuildSettings(guildId);
    }

    await command
      .autocomplete(interaction)
      .catch((e) => this.bot.logger.error(e));
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

    const timeLeft = TimeUtilities.difference(rateLimit.expires, Date.now())
      .toString()
      .trim();

    const cooldownMessage = `Command cooldown. Try again${
      timeLeft ? ` in ${timeLeft}` : ""
    }.`;

    interaction.reply({
      content: cooldownMessage,
      ephemeral: true,
    });

    return false;
  }

  private hasPermission(
    command: DiscordCommand,
    channel: TextChannel,
    user: User,
    dm: boolean
  ): boolean {
    if (command.admin && !this.bot.isOwner(user.id)) {
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
