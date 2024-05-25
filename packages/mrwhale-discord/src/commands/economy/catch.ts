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
    try {
      const { fishCaughtEmbed, catchButtons } = await this.botClient.catchFish(
        interaction
      );
      const replyOptions = { embeds: [fishCaughtEmbed] };

      if (catchButtons) {
        replyOptions["components"] = [catchButtons];
      }

      return interaction.reply(replyOptions);
    } catch (error) {
      this.botClient.logger.error("Error catching fish:", error);
      return interaction.reply("An error occured while catching fish.");
    }
  }
}
