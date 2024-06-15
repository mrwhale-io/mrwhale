import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import { getBotInfo } from "../../util/embed/bot-info-helpers";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "info",
      description: "Get bot information.",
      type: "utility",
      usage: "<prefix>info",
      aliases: ["uptime", "stats", "version", "about"],
      cooldown: 10000,
    });
  }

  async action(
    message: Message
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    const botInfoEmbed = getBotInfo(message, this.botClient);
    return message.reply({ embeds: [botInfoEmbed] });
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    const botInfoEmbed = getBotInfo(interaction, this.botClient);
    return interaction.reply({ embeds: [botInfoEmbed] });
  }
}
