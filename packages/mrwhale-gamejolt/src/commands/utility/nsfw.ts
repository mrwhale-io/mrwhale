import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "nsfw",
      description:
        "Toggles NSFW dictionary definitions on or off for this room.",
      type: "utility",
      usage: "<prefix>nsfw <on|off>",
      examples: ["<prefix>nsfw on", "<prefix>nsfw off"],
      owner: true,
    });
  }

  async action(message: Message, [setting]: [string]): Promise<Message> {
    try {
      if (!setting) {
        // Get current setting
        const currentSetting = await this.botClient.getNsfwEnabled(
          message.room_id,
        );
        const status = currentSetting ? "enabled" : "disabled";
        return message.reply(
          `🔞 NSFW dictionary definitions are currently **${status}** for this room.`,
        );
      }

      const normalizedSetting = setting.toLowerCase();

      if (
        !["on", "off", "enable", "disable", "enabled", "disabled"].includes(
          normalizedSetting,
        )
      ) {
        return message.reply(
          "❌ Please specify 'on' or 'off' to toggle NSFW definitions.",
        );
      }

      const enableNsfw = ["on", "enable", "enabled"].includes(
        normalizedSetting,
      );

      await this.botClient.setNsfwEnabled(message.room_id, enableNsfw);

      const status = enableNsfw ? "enabled" : "disabled";
      const emoji = enableNsfw ? "🔞" : "🚫";

      return message.reply(
        `${emoji} Successfully ${status} NSFW dictionary definitions for this room.`,
      );
    } catch (error) {
      return message.reply(`❌ Error updating NSFW setting: ${error.message}`);
    }
  }
}
