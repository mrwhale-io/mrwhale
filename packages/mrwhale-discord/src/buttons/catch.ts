import {
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  InteractionResponse,
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
  ): Promise<InteractionResponse<boolean>> {
    try {
      const { fishCaughtEmbed, catchButtons } = await this.botClient.catchFish(
        interaction
      );
      const replyOptions = { embeds: [fishCaughtEmbed] };

      if (catchButtons) {
        replyOptions["components"] = [catchButtons];
      }

      return interaction.reply(replyOptions);
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
