import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
  Message,
} from "discord.js";

import { Mood } from "@mrwhale-io/core";
import { DiscordCommand } from "../../client/command/discord-command";
import { EMBED_COLOR } from "../../constants";
import {
  getFavoriteFish,
  getTotalFishFedByUserInGuild,
  getTotalFishFedInGuild,
} from "../../database/services/fish-fed";
import { drawHungerHealthBar } from "../../util/draw-hunger-health-bar";

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
    const embed = await this.getHungerLevelEmbed(
      message.author.id,
      message.guildId
    );
    return message.reply({ embeds: [embed] });
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<InteractionResponse<boolean>> {
    const embed = await this.getHungerLevelEmbed(
      interaction.member.user.id,
      interaction.guildId
    );
    return interaction.reply({ embeds: [embed] });
  }

  private async getHungerLevelEmbed(userId: string, guildId: string) {
    const hungerLevel = await this.botClient.getGuildHungerLevel(guildId);
    const currentMood = await this.botClient.getCurrentMood(guildId);
    const lastFedTimestamp = await this.botClient.lastFedTimestamp(guildId);
    const lastFedString = lastFedTimestamp
      ? `<t:${Math.floor(lastFedTimestamp / 1000)}:R>`
      : "Never";
    const whaleAvatar = this.botClient.client.user.displayAvatarURL();
    const totalFishFedByUser = await getTotalFishFedByUserInGuild(
      userId,
      guildId
    );
    const totalFishFedByGuild = await getTotalFishFedInGuild(guildId);
    const favoriteFish = await getFavoriteFish(guildId);
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .addFields([
        {
          name: "Satiety Level",
          value: `${drawHungerHealthBar(hungerLevel)}`,
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
        {
          name: "Favourite Fish",
          value: `${favoriteFish.icon} ${favoriteFish.name}`,
          inline: true,
        },
        {
          name: "Fish Fed",
          value: `${totalFishFedByUser}`,
          inline: true,
        },
        {
          name: "Total Fish Fed",
          value: `${totalFishFedByGuild}`,
          inline: true,
        },
      ])
      .setColor(EMBED_COLOR)
      .setTitle("❤️‍🩹 My mood and health status")
      .setDescription(`Here is how I'm currently feeling.`)
      .setFooter({
        text:
          "Use the /feed command to increase Mr. Whale's mood and satiety level.",
        iconURL: whaleAvatar,
      });

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
