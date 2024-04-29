import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import { EMBED_COLOR } from "../../constants";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "hungerlevel",
      description: "Get Mr. Whale's current hunger level.",
      type: "economy",
      usage: "<prefix>hungerlevel",
      cooldown: 3000,
    });
  }

  async action(message: Message): Promise<Message<boolean>> {
    const embed = this.getHungerLevelEmbed(message.guildId);
    return message.reply({ embeds: [embed] });
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<InteractionResponse<boolean>> {
    const embed = this.getHungerLevelEmbed(interaction.guildId);
    return interaction.reply({ embeds: [embed] });
  }

  private getHungerLevelEmbed(guildId: string) {
    const hungerLevel = this.botClient.getGuildHungerLevel(guildId);
    const currentProgress = Math.floor((hungerLevel / 100) * 100);
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .addFields([
        {
          name: "Hunger Level",
          value: `${this.drawHealthBar(hungerLevel)} ${currentProgress}%`,
        },
      ])
      .setColor(EMBED_COLOR)
      .setTitle("My hunger level")
      .setDescription("Here is my hunger level");

    return embed;
  }

  private drawHealthBar(hungerLevel: number) {
    const progressLength = 20;
    const currentProgress = Math.floor((hungerLevel / 100) * progressLength);
    let progressBar = "";

    for (let i = 0; i < progressLength; i++) {
      progressBar += currentProgress < i ? "░" : "▓";
    }

    return progressBar;
  }
}
