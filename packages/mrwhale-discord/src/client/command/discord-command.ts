import { Command, DEFAULT_COMMAND_RATE_LIMIT } from "@mrwhale-io/core";
import {
  ChatInputCommandInteraction,
  Message,
  PermissionResolvable,
} from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import { DiscordCommandRateLimiter } from "./discord-command-rate-limiter";
import { DiscordBotClient } from "../discord-bot-client";
import { DiscordCommandOptions } from "../../types/discord-command-options";

export abstract class DiscordCommand extends Command<DiscordBotClient> {
  /**
   * Permissions required by the command caller.
   */
  callerPermissions: PermissionResolvable[];

  /**
   * Permissions required by the client.
   */
  clientPermissions: PermissionResolvable[];

  /**
   * Whether this is for guilds only.
   */
  guildOnly: boolean;

  /**
   * The name or alias that invoked this command.
   */
  invokedWith: string;

  /**
   * The slash command builder.
   */
  readonly slashCommandData: SlashCommandBuilder;

  /**
   * Command rate limiter.
   */
  readonly rateLimiter: DiscordCommandRateLimiter;

  constructor(options: DiscordCommandOptions) {
    super(options);
    this.guildOnly = options.guildOnly ?? false;
    this.callerPermissions = options.callerPermissions ?? [];
    this.clientPermissions = options.clientPermissions ?? [];
    this.slashCommandData = new SlashCommandBuilder()
      .setName(options.name)
      .setDescription(options.description);
    this.rateLimiter = new DiscordCommandRateLimiter(
      DEFAULT_COMMAND_RATE_LIMIT,
      options.cooldown
    );
  }

  /**
   * The action this command performs.
   *
   * @param message The message that invoked this command.
   * @param [args] Any arguments passed with this command.
   */
  abstract action(message: Message, args?: unknown[]): Promise<unknown>;

  /**
   * The slash command action this command performs.
   *
   * @param interaction The interaction that invoked this command.
   */
  slashCommandAction?(
    interaction: ChatInputCommandInteraction
  ): Promise<unknown>;
}
