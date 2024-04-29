import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  InteractionResponse,
} from "discord.js";

import { DiscordButton } from "../client/button/discord-button";
import { Buttons } from "../types/buttons";
import { getCaughtFishEmbed } from "../util/embed-helpers";

export default class extends DiscordButton {
  constructor() {
    super({
      name: Buttons.Catch,
      cooldown: 3000,
    });
  }

  async action(
    interaction: ButtonInteraction
  ): Promise<InteractionResponse<boolean>> {
    const guildId = interaction.guildId;
    const userId = interaction.member.user.id;

    const fishCaught = await this.botClient.catchFish(guildId, userId);
    const oceanHandler = this.botClient.buttons.get(Buttons.Ocean);
    const oceanButton = oceanHandler.getButtonBuilder(
      interaction.member.user.id
    );
    const catchButton = this.getButtonBuilder(interaction.member.user.id);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      catchButton,
      oceanButton
    );
    const embed = await getCaughtFishEmbed(fishCaught);

    return interaction.reply({ components: [row], embeds: [embed] });
  }

  getButtonBuilder(id: string): ButtonBuilder {
    const catchButton = new ButtonBuilder()
      .setCustomId(`${this.name}${id}`)
      .setLabel("Fish Again")
      .setEmoji("🎣")
      .setStyle(ButtonStyle.Primary);

    return catchButton;
  }
}
