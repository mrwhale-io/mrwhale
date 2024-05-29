import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import { getOceanEmbed } from "../../util/embed/ocean-embed-helpers";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "ocean",
      description: "View the ocean to see what creatures are lurking.",
      type: "economy",
      usage: "<prefix>ocean",
      guildOnly: true,
      cooldown: 3000,
    });
  }

  async action(
    message: Message
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    const ocean = await getOceanEmbed(message, this.botClient);

    return message.reply({ embeds: [ocean] });
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    const ocean = await getOceanEmbed(interaction, this.botClient);

    return interaction.reply({ embeds: [ocean] });
  }
}
