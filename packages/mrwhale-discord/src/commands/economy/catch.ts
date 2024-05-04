import {
  ActionRowBuilder,
  ButtonBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import { Buttons } from "../../types/buttons";
import { getCaughtFishEmbed } from "../../util/embed-helpers";
import { EMBED_COLOR } from "../../constants";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "catch",
      description: "Catch some fish.",
      type: "economy",
      usage: "<prefix>catch",
      cooldown: 3000,
    });
  }

  async action(
    message: Message
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    return await this.catchFish(message);
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    return await this.catchFish(interaction);
  }

  private async catchFish(
    interaction: ChatInputCommandInteraction | Message
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    const guildId = interaction.guildId;
    const userId = interaction.member.user.id;
    const embed = new EmbedBuilder().setColor(EMBED_COLOR);

    const guildFish = this.botClient.getGuildFish(guildId);
    if (!guildFish) {
      embed.setDescription("There are no fish in the sea.");

      return interaction.reply({ embeds: [embed] });
    }

    if (!this.botClient.hasRemainingFishingAttempts(guildId, userId)) {
      embed.setDescription(
        "You have no remaining fishing attempts. Try again later."
      );

      return interaction.reply({ embeds: [embed] });
    }

    const fishCaught = await this.botClient.catchFish(guildId, userId);
    const oceanHandler = this.botClient.buttons.get(Buttons.Ocean);

    const oceanButton = oceanHandler.getButtonBuilder(
      interaction.member.user.id
    );
    const catchHandler = this.botClient.buttons.get(Buttons.Catch);
    const catchButton = catchHandler.getButtonBuilder(
      interaction.member.user.id
    );
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
}
