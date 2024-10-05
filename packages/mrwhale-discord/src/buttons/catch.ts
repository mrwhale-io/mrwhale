import {
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordButton } from "../client/button/discord-button";
import { Buttons } from "../types/button/buttons";

export default class extends DiscordButton {
  constructor() {
    super({
      name: Buttons.Catch,
    });
  }

  async action(
    interaction: ButtonInteraction
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    try {
      return await this.botClient.fishingManager.catchFish(interaction);
    } catch (error) {
      this.botClient.logger.error("Error catching fish:", error);
      return interaction.reply("An error occured while catching fish.");
    }
  }

  getButtonBuilder(id: string): ButtonBuilder {
    const catchButton = new ButtonBuilder()
      .setCustomId(`${this.name}${id}`)
      .setLabel("Cast Again")
      .setEmoji("🎣")
      .setStyle(ButtonStyle.Primary);

    return catchButton;
  }
}
