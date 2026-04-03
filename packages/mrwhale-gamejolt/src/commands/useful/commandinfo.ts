import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "commandinfo",
      description: "Get detailed information about a custom command.",
      type: "utility",
      aliases: ["command-info", "cinfo"],
      usage: "<prefix>commandinfo <name>",
      examples: ["commandinfo greet", "commandinfo welcome"],
      groupOnly: true,
      cooldown: 30000,
    });
  }

  async action(message: Message, args: string[]): Promise<Message> {
    if (args.length === 0) {
      const prefix = await this.botClient.getPrefix(message.room_id);
      return message.reply(
        `❌ **Usage:** \`${prefix}commandinfo <name>\`\n\n` +
          `Use \`${prefix}listcommands\` to see available custom commands.`,
      );
    }

    const commandName = args[0].toLowerCase();

    try {
      const roomCommands =
        await this.botClient.customCommandManager.getRoomCustomCommands(
          message.room_id,
        );
      const command = roomCommands.commands.get(commandName);

      if (!command) {
        const prefix = await this.botClient.getPrefix(message.room_id);
        return message.reply(
          `❌ Custom command \`${commandName}\` not found.\n\n` +
            `Use \`${prefix}listcommands\` to see available commands.`,
        );
      }

      const prefix = await this.botClient.getPrefix(message.room_id);
      const creator = await this.getCreatorName(command.createdBy);

      let response = `📋 **Custom Command Information**\n\n`;
      response += `**Name:** \`${prefix}${command.name}\`\n`;

      if (command.aliases.length > 0) {
        response += `**Aliases:** ${command.aliases
          .map((a) => `\`${prefix}${a}\``)
          .join(", ")}\n`;
      }

      response += `**Description:** ${command.description}\n`;
      response += `**Content:**\n\`\`\`\n${command.content}\n\`\`\`\n`;

      response += `**Statistics:**\n`;
      response += `- Usage Count: ${command.usageCount}\n`;
      response += `- Created: ${command.createdAt.toLocaleDateString()}\n`;
      response += `- Updated: ${command.updatedAt.toLocaleDateString()}\n`;
      response += `- Created By: ${creator}\n`;

      if (command.cooldown > 0) {
        response += `- Cooldown: ${command.cooldown / 1000}s\n`;
      }

      response += `**Status:** ${
        command.enabled ? "✅ Enabled" : "❌ Disabled"
      }\n`;

      // Show permissions if any are set
      const permissions = command.permissions;
      if (
        permissions.ownerOnly ||
        permissions.groupOnly ||
        permissions.allowedUsers.length > 0 ||
        permissions.blockedUsers.length > 0
      ) {
        response += `\n**Permissions:**\n`;

        if (permissions.ownerOnly) {
          response += `- Owner Only: ✅\n`;
        }
        if (permissions.groupOnly) {
          response += `- Group Only: ✅\n`;
        }
        if (permissions.allowedUsers.length > 0) {
          response += `- Allowed Users: ${permissions.allowedUsers.length}\n`;
        }
        if (permissions.blockedUsers.length > 0) {
          response += `- Blocked Users: ${permissions.blockedUsers.length}\n`;
        }
      }

      // Show behavior settings
      if (
        command.behavior.randomResponse ||
        command.behavior.mentionUser ||
        command.behavior.deleteTrigger ||
        command.behavior.autoDelete > 0
      ) {
        response += `\n**Behavior:**\n`;

        if (command.behavior.randomResponse) {
          response += `- Random Response: ✅\n`;
        }
        if (command.behavior.mentionUser) {
          response += `- Mention User: ✅\n`;
        }
        if (command.behavior.deleteTrigger) {
          response += `- Delete Trigger: ✅\n`;
        }
        if (command.behavior.autoDelete > 0) {
          response += `- Auto Delete: ${command.behavior.autoDelete / 1000}s\n`;
        }
      }

      message.reply(response);
    } catch (error) {
      this.botClient.logger.error("Error getting command info:", error);
      message.reply("❌ Failed to get command information. Please try again.");
    }
  }

  private async getCreatorName(userId: number): Promise<string> {
    try {
      // Try to find the user in active rooms or friends list
      const user = this.botClient.chat.activeRooms.values();
      for (const room of user) {
        const roomUser = Array.from(room.members.values()).find(
          (u) => u.id === userId,
        );
        if (roomUser) {
          return `@${roomUser.username}`;
        }
      }

      // Check friends list
      const friend = this.botClient.friendsList.get(userId);
      if (friend) {
        return `@${friend.username}`;
      }

      return `User ID: ${userId}`;
    } catch (error) {
      return `User ID: ${userId}`;
    }
  }
}
