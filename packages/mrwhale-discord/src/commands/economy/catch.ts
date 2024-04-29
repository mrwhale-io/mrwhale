import {
  ActionRowBuilder,
  ButtonBuilder,
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import { Buttons } from "../../types/buttons";
import { getCaughtFishEmbed } from "../../util/embed-helpers";

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
    const embed = await getCaughtFishEmbed(fishCaught);

    return interaction.reply({ components: [row], embeds: [embed] });
  }
}
