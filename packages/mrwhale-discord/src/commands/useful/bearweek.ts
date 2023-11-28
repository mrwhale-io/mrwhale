import { bearweek } from "@mrwhale-io/commands";
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
    super(bearweek.data);
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
    const now = new Date();
    const nextBearWeekYear = bearweek.getBearWeekYear(now);

    const embed = new EmbedBuilder()
      .setTitle(`Bear week ${nextBearWeekYear} countdown!`)
      .setColor(EMBED_COLOR)
      .setDescription(bearweek.action());

    return interaction.reply({ embeds: [embed] });
  }
}
