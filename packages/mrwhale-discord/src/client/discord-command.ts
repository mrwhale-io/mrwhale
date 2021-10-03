import { Command, CommandOptions } from "@mrwhale-io/core";
import { Client, CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import { DiscordCommandRateLimiter } from "./discord-command-rate-limiter";

const COMMAND_RATE_LIMIT = 1;
const COMMAND_COOLDOWN_DEFAULT = 1000;

export abstract class DiscordCommand extends Command<Client> {
  readonly slashCommandData: SlashCommandBuilder;
  readonly rateLimiter: DiscordCommandRateLimiter;

  constructor(options: CommandOptions) {
    super(options);
    this.slashCommandData = new SlashCommandBuilder()
      .setName(options.name)
      .setDescription(options.description);
    this.rateLimiter = new DiscordCommandRateLimiter(
      COMMAND_RATE_LIMIT,
      options.cooldown || COMMAND_COOLDOWN_DEFAULT
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
