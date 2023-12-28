import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "levels",
      description: "Toggle levels on and off.",
      type: "admin",
      usage: "<prefix>levels",
      guildOnly: true,
      callerPermissions: ["Administrator"],
    });
  }

  async action(
    message: Message
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    return this.enableLevels(message);
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    return this.enableLevels(interaction);
  }

  private async enableLevels(
    interaction: Message | ChatInputCommandInteraction
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    let enabled = await this.isLevelsEnabled(interaction.guildId);
    enabled = !enabled;

    const settings = this.botClient.guildSettings.get(interaction.guildId);

    if (settings) {
      settings.set("levels", enabled);
    }

    return enabled
      ? interaction.reply("Levels enabled.")
      : interaction.reply("Levels disabled.");
  }

  private async isLevelsEnabled(guildId: string): Promise<boolean> {
    if (!this.botClient.guildSettings.has(guildId)) {
      return false;
    }

    const settings = this.botClient.guildSettings.get(guildId);

    return await settings.get("levels", true);
  }
}
