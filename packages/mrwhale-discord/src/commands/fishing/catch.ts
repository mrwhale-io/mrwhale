import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "catch",
      description: "Catch some fish.",
      type: "fishing",
      usage: "<prefix>catch",
      guildOnly: true,
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
      return await this.botClient.fishingManager.catchFish(interaction);
    } catch (error) {
      this.botClient.logger.error("Error catching fish:", error);
      return interaction.reply("An error occured while catching fish.");
    }
  }
}
