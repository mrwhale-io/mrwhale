import { choose } from "@mrwhale-io/commands";
import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(choose.data);
    this.slashCommandData.addStringOption((option) =>
      option.setName("1st").setRequired(true).setDescription("The 1st option.")
    );
    this.slashCommandData.addStringOption((option) =>
      option.setName("2nd").setRequired(true).setDescription("The 2nd option.")
    );
    this.slashCommandData.addStringOption((option) =>
      option.setName("3rd").setDescription("The 3rd option.")
    );
    this.slashCommandData.addStringOption((option) =>
      option.setName("4th").setDescription("The 4th option.")
    );
    this.slashCommandData.addStringOption((option) =>
      option.setName("5th").setDescription("The 5th option.")
    );
    this.slashCommandData.addStringOption((option) =>
      option.setName("6th").setDescription("The 6th option.")
    );
    this.slashCommandData.addStringOption((option) =>
      option.setName("7th").setDescription("The 7th option.")
    );
    this.slashCommandData.addStringOption((option) =>
      option.setName("8th").setDescription("The 8th option.")
    );
    this.slashCommandData.addStringOption((option) =>
      option.setName("9th").setDescription("The 9th option.")
    );
  }

  async action(message: Message, args: string[]): Promise<Message> {
    return message.reply(choose.action(args));
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<InteractionResponse<boolean>> {
    const options = [
      interaction.options.getString("1st"),
      interaction.options.getString("2nd"),
      interaction.options.getString("3rd"),
      interaction.options.getString("4th"),
      interaction.options.getString("5th"),
      interaction.options.getString("6th"),
      interaction.options.getString("7th"),
      interaction.options.getString("8th"),
      interaction.options.getString("9th"),
    ].filter((option) => option !== null);

    return interaction.reply(choose.action(options));
  }
}
