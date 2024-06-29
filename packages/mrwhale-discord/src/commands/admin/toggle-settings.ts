import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import { Settings } from "../../types/settings";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "togglesettings",
      description: "Toggle various settings on and off.",
      type: "admin",
      usage: "<prefix>togglesettings <option>",
      guildOnly: true,
      callerPermissions: ["Administrator"],
    });

    this.slashCommandData.addStringOption((option) =>
      option
        .setName("setting")
        .setDescription("Choose a setting to toggle.")
        .setRequired(true)
        .addChoices(
          { name: "Level Ups", value: "levels" },
          { name: "Fishing Announcements", value: "fishing" },
          { name: "Hunger Announcements", value: "hunger" },
          { name: "Greetings", value: "greetings" }
        )
    );
  }

  async action(
    message: Message,
    [option]: [string]
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    return this.toggleSetting(message, option);
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    const option = interaction.options.getString("setting");
    return this.toggleSetting(interaction, option);
  }

  private async toggleSetting(
    interaction: Message | ChatInputCommandInteraction,
    option: string
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    let settingKey: Settings;
    let settingName: string;
    let defaultSetting = true;

    switch (option) {
      case "levels":
        settingKey = Settings.Levels;
        settingName = "Level Up Messages";
        break;
      case "fishing":
        settingKey = Settings.FishingAnnouncements;
        settingName = "Fishing Announcements";
        break;
      case "hunger":
        settingKey = Settings.HungerAnnouncements;
        settingName = "Hunger Announcements";
        break;
      case "greetings":
        settingKey = Settings.Greetings;
        settingName = "Greetings";
        defaultSetting = false;
        break;
      default:
        return interaction.reply("Invalid setting option.");
    }

    const settings = this.botClient.guildSettings.get(interaction.guildId);
    let enabled = await this.isSettingEnabled(
      interaction.guildId,
      settingKey,
      defaultSetting
    );
    enabled = !enabled;

    if (settings) {
      settings.set(settingKey, enabled);
    }

    return interaction.reply(
      `${settingName} ${enabled ? "enabled" : "disabled"}.`
    );
  }

  private async isSettingEnabled(
    guildId: string,
    settingKey: Settings,
    defaultSetting: boolean
  ): Promise<boolean> {
    if (!this.botClient.guildSettings.has(guildId)) {
      return false;
    }

    const settings = this.botClient.guildSettings.get(guildId);
    return await settings.get(settingKey, defaultSetting);
  }
}
