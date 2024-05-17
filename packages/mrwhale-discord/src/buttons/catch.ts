import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder,
  InteractionResponse,
} from "discord.js";

import { DiscordButton } from "../client/button/discord-button";
import { Buttons } from "../types/buttons";
import { getCaughtFishEmbed } from "../util/embed-helpers";
import { EMBED_COLOR } from "../constants";

export default class extends DiscordButton {
  constructor() {
    super({
      name: Buttons.Catch,
    });
  }

  async action(
    interaction: ButtonInteraction
  ): Promise<InteractionResponse<boolean>> {
    const guildId = interaction.guildId;
    const userId = interaction.member.user.id;

    const guildFish = this.botClient.getGuildFish(guildId);
    if (!guildFish) {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setDescription("🎣 There are no fish in the sea.");

      return interaction.reply({ embeds: [embed] });
    }

    if (!this.botClient.hasRemainingFishingAttempts(guildId, userId)) {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setDescription(
          "🎣 You have no remaining fishing attempts. Try again later."
        );

      return interaction.reply({ embeds: [embed] });
    }

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
    const fishCaughtEmbed = await getCaughtFishEmbed(
      fishCaught,
      interaction,
      this.botClient
    );

    return interaction.reply({ components: [row], embeds: [fishCaughtEmbed] });
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
