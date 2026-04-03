import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "commandlimits",
      description: "View custom command limits and permissions for this room.",
      type: "custom",
      aliases: ["cmd-limits", "command-limits", "customlimits"],
      usage: "<prefix>commandlimits",
      examples: ["commandlimits"],
      groupOnly: true,
      cooldown: 5000,
    });
  }

  async action(message: Message): Promise<Message> {
    try {
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
      const userTier = userSubscription?.tier || "free";

      let response = `📊 **Custom Command Limits**\n\n`;

      // Room information
      response += `**Room Status:** \`${roomCommands.subscriptionTier.toUpperCase()}\`\n`;
      response += `**Commands:** \`${roomCommands.commands.size}/${roomCommands.limits.maxCommands}\`\n`;
      response += `**Daily Usage:** \`${roomCommands.dailyUsage.totalUsage}/${roomCommands.limits.dailyUsage}\`\n`;
      response += `**Content Limit:** \`${roomCommands.limits.maxContentLength}\` characters\n`;
      response += `**Total Usage:** \`${roomCommands.totalUsage}\` all-time\n\n`;

      // User permissions
      response += `**Your Permissions:**\n`;
      if (isOwner) {
        const subscriptionStatus = hasActiveSub
          ? ` (${userTier.toUpperCase()} Subscriber)`
          : " (Free Tier)";
        response += `- ✅ **Room Owner**${subscriptionStatus} - Full command management\n`;
        response += `- Can create, edit, and delete any command\n`;
        if (!hasActiveSub) {
          response += `- ℹ️ Room ownership grants command creation regardless of subscription\n`;
        }
      } else if (hasActiveSub) {
        response += `- ⭐ **${userTier.toUpperCase()} Subscriber** - Command creation enabled\n`;
        response += `- Can create and edit your own commands\n`;
      } else {
        response += `- 🆓 **Free User** - Usage only\n`;
        response += `- Can use existing commands but cannot create new ones\n`;
        response += `- 💡 **Tip:** Create your own room to become a room owner and unlock command creation!\n`;
      }

      // Show subscription tiers comparison
      response += `\n**Subscription Tier Comparison:**\n`;
      response += `🆓 **Free:** 5 commands, 50 daily uses\n`;
      response += `⭐ **Premium ($4.99):** 25 commands, 500 daily uses\n`;
      response += `💎 **Pro ($9.99):** 100 commands, 2000 daily uses\n`;

      // Show upgrade prompt for free users
      if (!hasActiveSub && !isOwner) {
        const prefix = await this.botClient.getPrefix(message.room_id);
        response += `\n💡 **Want to create commands?**\n`;
        response += `- **Option 1:** Create your own room (free) to become a room owner\n`;
        response += `- **Option 2:** Use \`${prefix}subscribe\` to upgrade anywhere\n`;
      } else if (!hasActiveSub && isOwner) {
        const prefix = await this.botClient.getPrefix(message.room_id);
        response += `\n💡 **Want more command limits?** Use \`${prefix}subscribe\` to upgrade your room!`;
      }

      // Show most active commands if any exist
      const allCommands = await this.botClient.customCommandManager.getCommands(
        message.room_id,
      );
      const activeCommands = allCommands
        .filter((cmd) => cmd.usageCount > 0)
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 3);

      if (activeCommands.length > 0) {
        response += `\n\n**Most Used Commands:**\n`;
        activeCommands.forEach((cmd, index) => {
          response += `${index + 1}. \`${cmd.name}\` - ${
            cmd.usageCount
          } uses\n`;
        });
      }

      return message.reply(response);
    } catch (error) {
      this.botClient.logger.error("Error fetching command limits:", error);
      return message.reply(
        "❌ **Failed to fetch command limits.** Please try again.",
      );
    }
  }
}
