import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";

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
    return message.reply(this.getHungerLevel(message.guildId));
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<InteractionResponse<boolean>> {
    return interaction.reply(this.getHungerLevel(interaction.guildId));
  }

  private getHungerLevel(guildId: string) {
    const hungerLevel = this.botClient.getGuildHungerLevel(guildId);

    return `My hunger level is ${+hungerLevel.toFixed(2)}`;
  }
}
