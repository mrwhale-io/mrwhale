import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "policer",
      description: "Toggles the chat policer on or off for this room.",
      type: "utility", 
      usage: "<prefix>policer <on|off>",
      examples: ["<prefix>policer on", "<prefix>policer off"],
      owner: true,
    });
  }

  async action(message: Message, [setting]: [string]): Promise<Message> {
    try {
      if (!setting) {
        // Get current setting
        const currentSetting = await this.botClient.getPolicerEnabled(message.room_id);
        const status = currentSetting ? "enabled" : "disabled";
        return message.reply(`🛡️ Chat policer is currently **${status}** for this room.`);
      }

      const normalizedSetting = setting.toLowerCase();
      
      if (!["on", "off", "enable", "disable", "enabled", "disabled"].includes(normalizedSetting)) {
        return message.reply("❌ Please specify 'on' or 'off' to toggle the policer.");
      }

      const enablePolicer = ["on", "enable", "enabled"].includes(normalizedSetting);
      
      await this.botClient.setPolicerEnabled(message.room_id, enablePolicer);
      
      const status = enablePolicer ? "enabled" : "disabled";
      const emoji = enablePolicer ? "🛡️" : "🔓";
      
      return message.reply(
        `${emoji} Successfully ${status} the chat policer for this room.`
      );
    } catch (error) {
      return message.reply(`❌ Error updating policer setting: ${error.message}`);
    }
  }
}