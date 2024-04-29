import {
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Message,
} from "discord.js";

import { DiscordButton } from "../client/button/discord-button";
import { Buttons } from "../types/buttons";
import { getOceanEmbed } from "../util/embed-helpers";

export default class extends DiscordButton {
  constructor() {
    super({
      name: Buttons.Ocean,
      cooldown: 3000,
    });
  }

  async action(interaction: ButtonInteraction): Promise<Message<boolean>> {
    const embed = await getOceanEmbed(interaction, this.botClient);

    return await interaction.message.edit({ components: [], embeds: [embed] });
  }

  getButtonBuilder(id: string): ButtonBuilder {
    const ocean = new ButtonBuilder()
      .setCustomId(`${this.name}${id}`)
      .setLabel("View Ocean")
      .setEmoji("🌊")
      .setStyle(ButtonStyle.Primary);

    return ocean;
  }
}
