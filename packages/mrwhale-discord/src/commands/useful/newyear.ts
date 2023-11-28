import { newyear } from "@mrwhale-io/commands";
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import { EMBED_COLOR } from "../../constants";

export default class extends DiscordCommand {
  constructor() {
    super(newyear.data);
  }

  async action(
    message: Message
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    return this.replyWithEmbed(message);
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    return this.replyWithEmbed(interaction);
  }

  private replyWithEmbed(
    interaction: ChatInputCommandInteraction | Message
  ): Promise<Message<boolean>> | Promise<InteractionResponse<boolean>> {
    const embed = new EmbedBuilder()
      .setTitle("New year countdown! 🎉")
      .setColor(EMBED_COLOR)
      .setDescription(newyear.action());

    return interaction.reply({ embeds: [embed] });
  }
}
