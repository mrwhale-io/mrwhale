import {
  Command,
  CommandOptions,
  DEFAULT_COMMAND_RATE_LIMIT,
} from "@mrwhale-io/core";
import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import { DiscordCommandRateLimiter } from "./discord-command-rate-limiter";
import { DiscordBotClient } from "./discord-bot-client";

export abstract class DiscordCommand extends Command<DiscordBotClient> {
  /**
   * The slash command builder.
   */
  readonly slashCommandData: SlashCommandBuilder;
  readonly rateLimiter: DiscordCommandRateLimiter;

  constructor(options: CommandOptions) {
    super(options);
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
   * @param interaction The message that invoked this command.
   * @param [args] Any arguments passed with this command.
   */
  abstract action(
    interaction: CommandInteraction,
    args?: unknown[]
  ): Promise<unknown>;
}
