import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "listcommands",
      description: "List all custom commands in this room.",
      type: "custom",
      aliases: ["list-commands", "customcommands", "commands"],
      usage: "<prefix>listcommands [page]",
      examples: ["listcommands", "listcommands 2"],
      groupOnly: true,
      cooldown: 30000,
    });
  }

  async action(message: Message, args: string[]): Promise<Message> {
    try {
      // Get paginated commands
      const page = Math.max(1, parseInt(args[0]) || 1);
      const pageSize = 10;
      const paginatedResult =
        await this.botClient.customCommandManager.getCommandsPaginated(
          message.room_id,
          page,
          pageSize,
          true, // enabled only
        );

      if (paginatedResult.totalCommands === 0) {
        const prefix = await this.botClient.getPrefix(message.room_id);
        const room = this.botClient.chat.activeRooms.get(message.room_id);
        const isRoomOwner = room?.owner_id === message.user.id;

        let noCommandsMessage = `📝 **No custom commands found.**\n\n`;

        if (isRoomOwner) {
          noCommandsMessage += `As the room owner, you can create custom commands using \`${prefix}createcommand\`.\n`;
        } else {
          noCommandsMessage += `Room owners and premium subscribers can create custom commands using \`${prefix}createcommand\`.\n`;
        }

        noCommandsMessage += `**Example:** \`${prefix}createcommand greet This is a greeting command. | Hello {user.display_name}!\``;

        if (!isRoomOwner) {
          noCommandsMessage += `\n\n💡 **Want to create commands?**\n`;
          noCommandsMessage += `- Create your own room (free) to become a room owner\n`;
          noCommandsMessage += `- Or use \`${prefix}subscribe\` to upgrade`;
        }

        return message.reply(noCommandsMessage);
      }

      const {
        commands: pageCommands,
        totalCommands,
        totalPages,
        currentPage,
      } = paginatedResult;
      const prefix = await this.botClient.getPrefix(message.room_id);
      let response = `📝 **Custom Commands** (Page ${currentPage}/${totalPages})\n\n`;

      pageCommands.forEach((cmd) => {
        const aliases =
          cmd.aliases.length > 0
            ? ` (${cmd.aliases.map((a) => `\`${a}\``).join(", ")})`
            : "";
        const usage =
          cmd.usageCount > 0
            ? ` (Used ${cmd.usageCount} time${cmd.usageCount === 1 ? "" : "s"})`
            : "";

        // Format similar to help command with bullet points and concise descriptions
        response += `- \`${prefix}${
          cmd.name
        }\`${aliases} - ${cmd.description.slice(0, 60)}${
          cmd.description.length > 60 ? "..." : ""
        }${usage}\n`;
      });

      if (totalPages > 1) {
        response += `\nUse \`${prefix}listcommands ${
          currentPage + 1
        }\` for the next page.`;
      }

      // Get room commands info for limits display
      const roomCommands =
        await this.botClient.customCommandManager.getRoomCustomCommands(
          message.room_id,
        );
      response += `\n\n📊 **Limits & Usage:**\n`;
      response += `- Commands: ${totalCommands}/${
        roomCommands.limits.maxCommands
      } \`(${roomCommands.subscriptionTier.toUpperCase()})\`\n`;
      response += `- Daily Usage: ${roomCommands.dailyUsage.totalUsage}/${roomCommands.limits.dailyUsage}\n`;
      if (roomCommands.totalUsage > 0) {
        response += `- Total Usage: ${roomCommands.totalUsage}\n`;
      }

      if (roomCommands.subscriptionTier === "free") {
        const prefix = await this.botClient.getPrefix(message.room_id);
        const room = this.botClient.chat.activeRooms.get(message.room_id);
        const isRoomOwner = room?.owner_id === message.user.id;

        if (isRoomOwner) {
          response += `\n\n💡 **Want higher limits?** Use \`${prefix}subscribe\` to upgrade your room!`;
        } else {
          response += `\n\n💡 **Want to create commands?**`;
          response += `\n- Create your own room (free) to become a room owner`;
          response += `\n- Or use \`${prefix}subscribe\` to upgrade`;
        }
        response += `\n⭐ Premium: 25 commands, 500 daily uses\n💎 Pro: 100 commands, 2000 daily uses`;
      }

      message.reply(response);
    } catch (error) {
      this.botClient.logger.error("Error listing custom commands:", error);
      message.reply("❌ Failed to list custom commands. Please try again.");
    }
  }
}
