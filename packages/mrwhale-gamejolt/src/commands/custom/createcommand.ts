import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "createcommand",
      description: "Create a new custom command for this room.",
      type: "custom",
      aliases: ["create-command", "newcommand", "addcommand"],
      usage: "<prefix>createcommand <name> <description> | <content>",
      examples: [
        "createcommand greet Welcome new members! | Hello {user.display_name}! Welcome to our room!",
        "createcommand dice Roll a dice | 🎲 {user.display_name} rolled: {random(1,6)}",
      ],
      groupOnly: true,
      cooldown: 10000,
    });
  }

  async action(message: Message, args: string[]): Promise<Message> {
    if (!args || args.length === 0) {
      const command = await this.getNameWithPrefix(message.room_id);
      return message.reply(
        `❌ **Usage:** \`${command} <name> <description> | <content>\`\n\n` +
          `**Examples:**\n` +
          `• \`${command} greet Welcome new members! | Hello {user.display_name}!\`\n` +
          `• \`${command} dice Roll dice | 🎲 Rolled: {random(1,6)}\`\n\n` +
          `**Template Variables:**\n` +
          `• \`{user.display_name}\` - User's display name\n` +
          `• \`{user.username}\` - User's username\n` +
          `• \`{room.title}\` - Room title\n` +
          `• \`{random(1,10)}\` - Random number\n` +
          `• \`{choose(apple,banana,cherry)}\` - Random choice\n` +
          `• \`{time(short)}\` - Current time`,
      );
    }

    // Parse arguments
    const fullArgs = args.join(" ");
    const parts = fullArgs.split(" | ");

    if (parts.length !== 2) {
      const command = await this.getNameWithPrefix(message.room_id);
      return message.reply(
        `❌ **Invalid format.** Use: \`${command} <name> <description> | <content>\`\n\n` +
          `The **|** separator is required between description and content.`,
      );
    }

    const [nameAndDesc, content] = parts;
    const nameDescParts = nameAndDesc.trim().split(/\s+/);

    if (nameDescParts.length < 2) {
      return message.reply(
        `❌ **Missing required fields.** Please provide both a name and description.`,
      );
    }

    const commandName = nameDescParts[0];
    const description = nameDescParts.slice(1).join(" ");

    try {
      // Check current room limits and user permissions
      const roomCommands =
        await this.botClient.customCommandManager.getRoomCustomCommands(
          message.room_id,
        );
      const room = this.botClient.chat.activeRooms.get(message.room_id);
      const isOwner = room?.owner_id === message.user.id;
      const userSubscription =
        await this.botClient.subscriptionManager.getUserSubscription(
          message.user.id,
        );
      const hasActiveSub = userSubscription?.status === "active";

      // Show current limits
      let permissionInfo = `📊 **Your Command Creation Rights:**\n`;
      permissionInfo += `• Room Type: ${roomCommands.subscriptionTier.toUpperCase()}\n`;
      permissionInfo += `• Commands: ${roomCommands.commands.size}/${roomCommands.limits.maxCommands}\n`;
      permissionInfo += `• Daily Usage: ${roomCommands.dailyUsage.totalUsage}/${roomCommands.limits.dailyUsage}\n`;
      permissionInfo += `• Max Content Length: ${roomCommands.limits.maxContentLength} chars\n`;

      if (isOwner) {
        permissionInfo += `• **Status:** ✅ Room Owner - Full Access (${
          hasActiveSub
            ? userSubscription.tier.toUpperCase() + " Subscriber"
            : "Free Tier"
        })\n`;
      } else if (hasActiveSub) {
        permissionInfo += `• **Status:** ⭐ Premium User - Can Create\n`;
      } else {
        permissionInfo += `• **Status:** ❌ Free User - Cannot Create\n`;
        const prefix = await this.botClient.getPrefix(message.room_id);
        permissionInfo += `\n💡 **Want to create commands?**\n`;
        permissionInfo += `• Become a room owner (create your own room)\n`;
        permissionInfo += `• Or use \`${prefix}subscribe\` to upgrade!`;
        return message.reply(permissionInfo);
      }

      const result =
        await this.botClient.customCommandManager.createCustomCommand(
          message.room_id,
          message.user.id,
          commandName,
          description,
          content.trim(),
        );

      if (result.success && result.command) {
        const prefix = await this.botClient.getPrefix(message.room_id);
        let response = `✅ **Custom command created!**\n\n`;
        response += `**Name:** \`${prefix}${result.command.name}\`\n`;
        response += `**Description:** ${result.command.description}\n`;
        response += `**Content:** ${
          result.command.content.length > 100
            ? result.command.content.substring(0, 100) + "..."
            : result.command.content
        }\n\n`;
        response += `Commands in room: ${roomCommands.commands.size + 1}/${
          roomCommands.limits.maxCommands
        }`;

        if (result.command.content.includes("{")) {
          response += `\n\n💡 **Tip:** Your command uses template variables! Test it to see how they work.`;
        }

        return message.reply(response);
      } else {
        return message.reply(
          `❌ ${result.error || "Failed to create command."}`,
        );
      }
    } catch (error) {
      this.botClient.logger.error("Error creating custom command:", error);
      return message.reply(
        "❌ **Failed to create command.** Please try again.",
      );
    }
  }
}
