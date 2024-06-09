import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
  Message,
} from "discord.js";
import { formatDistanceToNowStrict } from "date-fns";

import { Mood } from "@mrwhale-io/core";
import { DiscordCommand } from "../../client/command/discord-command";
import { EMBED_COLOR } from "../../constants";
import { drawHealthBar } from "../../util/draw-health-bar";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "whalemood",
      description: "Get Mr. Whale's current mood.",
      type: "utility",
      usage: "<prefix>whalemood",
      guildOnly: true,
      cooldown: 3000,
    });
  }

  async action(message: Message): Promise<Message<boolean>> {
    const embed = await this.getHungerLevelEmbed(message.guildId);
    return message.reply({ embeds: [embed] });
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<InteractionResponse<boolean>> {
    const embed = await this.getHungerLevelEmbed(interaction.guildId);
    return interaction.reply({ embeds: [embed] });
  }

  private async getHungerLevelEmbed(guildId: string) {
    const hungerLevel = await this.botClient.getGuildHungerLevel(guildId);
    const currentProgress = Math.floor((hungerLevel / 100) * 100);
    const currentMood = await this.botClient.getCurrentMood(guildId);
    const lastFedTimestamp = await this.botClient.lastFedTimestamp(guildId);
    const lastFedString = lastFedTimestamp
      ? formatDistanceToNowStrict(lastFedTimestamp, { addSuffix: true })
      : "Never";

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .addFields([
        {
          name: "Satiety Level",
          value: `${drawHealthBar(hungerLevel)} ${currentProgress}%`,
        },
        {
          name: "Mood",
          value: `${this.getEmoji(currentMood)} ${currentMood}`,
          inline: true,
        },
        {
          name: "Last Fed",
          value: `⏰ ${lastFedString}`,
          inline: true,
        },
      ])
      .setColor(EMBED_COLOR)
      .setTitle("❤️‍🩹 My mood and health status")
      .setDescription(`Here is how I'm currently feeling.`);

    return embed;
  }

  private getEmoji(mood: string): string {
    const emojis: Record<string, string> = {
      [Mood.Happy]: "😀",
      [Mood.Okay]: "👌",
      [Mood.Grumpy]: "😠",
    };

    return emojis[mood];
  }
}
