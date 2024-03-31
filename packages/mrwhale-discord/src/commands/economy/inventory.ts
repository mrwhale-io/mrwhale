import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
  Message,
} from "discord.js";

import { fishTypes } from "@mrwhale-io/core";
import { DiscordCommand } from "../../client/command/discord-command";
import { EMBED_COLOR } from "../../constants";
import { getUserFish } from "../../util/fishing";
import { UserFishInstance } from "src/database/models/user-fish";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "inventory",
      description: "Shows your inventory.",
      type: "economy",
      usage: "<prefix>inventory",
      cooldown: 3000,
    });
  }

  async action(
    message: Message
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    return this.showInventory(message);
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    return this.showInventory(interaction);
  }

  private async showInventory(
    interaction: ChatInputCommandInteraction | Message
  ) {
    try {
      const userId = interaction.member.user.id;
      const userFish = await getUserFish(userId);
      const embed = this.buildFishEmbed(userFish);

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return interaction.reply("Could not fetch your inventory.");
    }
  }

  private buildFishEmbed(fishCaught: UserFishInstance[]): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle("Your inventory");
    let fishCaughtDescription = "";
    if (fishCaught.length === 0) {
      fishCaughtDescription = "You have no fish in your inventory.";
    } else {
      for (const fish of fishCaught) {
        const fishTypeInfo = fishTypes.find(
          (fishType) => fishType.name === fish.fishName
        );
        fishCaughtDescription += `${fishTypeInfo.icon} ${fish.fishName}: ${fish.quantity}\n`;
      }
    }
    embed.addFields([
      {
        name: "Fish",
        value: fishCaughtDescription,
      },
    ]);

    return embed;
  }
}
