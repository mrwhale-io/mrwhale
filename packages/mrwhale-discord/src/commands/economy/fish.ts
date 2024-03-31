import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
  Message,
} from "discord.js";

import { FishCaughtResult, catchFish, getRandomInt } from "@mrwhale-io/core";
import { DiscordCommand } from "../../client/command/discord-command";
import { EMBED_COLOR } from "../../constants";
import { updateOrCreateUserFish } from "../../util/fishing";

const MIN_NUMBER_OF_CASTS = 5;
const MAX_NUMBER_OF_CASTS = 15;

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "fish",
      description: "Catch some fish.",
      type: "economy",
      usage: "<prefix>fish",
      cooldown: 5000,
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
    try {
      const userId = interaction.member.user.id;
      const numberOfCasts = getRandomInt(
        MIN_NUMBER_OF_CASTS,
        MAX_NUMBER_OF_CASTS
      );
      const fishCaughtCounts = catchFish(numberOfCasts);

      await updateOrCreateUserFish(userId, fishCaughtCounts);

      const embed = this.buildFishEmbed(fishCaughtCounts);

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return interaction.reply("🎣 You didn't catch anything this time.");
    }
  }

  private buildFishEmbed(
    fishCaughtCounts: Record<string, FishCaughtResult>
  ): EmbedBuilder {
    const embed = new EmbedBuilder().setColor(EMBED_COLOR);
    let description = "Here is a breakdown of what you caught:\n\n";
    let totalFishCaught = 0;

    for (const [key, value] of Object.entries(fishCaughtCounts)) {
      totalFishCaught += value.quantity;
      description += `${value.icon} ${key}: ${value.quantity}\n`;
    }

    embed.setTitle(`You caught ${totalFishCaught} fish!`);
    embed.setDescription(description);

    return embed;
  }
}
