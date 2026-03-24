import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "usage",
      description:
        "View detailed usage statistics for commands and premium features.",
      type: "utility",
      usage: "<prefix>usage [period]",
      examples: ["usage", "usage week", "usage month"],
      cooldown: 3000,
    });
  }

  async action(message: Message): Promise<Message> {
    if (!this.botClient.subscriptionManager) {
      return message.reply(
        "❌ **Subscription system not available**\n" +
          "Premium subscriptions are currently not configured on this bot instance.",
      );
    }

    try {
      const subscription =
        await this.botClient.subscriptionManager.getUserSubscription(
          message.user.id,
        );
      const usage = await this.botClient.subscriptionManager.getRemainingUsage(
        message.user.id,
      );

      let usageReport = `📊 **Usage Statistics**\n\n`;

      // Current plan information
      const planName = subscription ? subscription.tier.toUpperCase() : "FREE";
      const status = subscription ? subscription.status : "free";
      usageReport += `**Current Plan:** ${planName} ${this.getStatusEmoji(
        status,
      )}\n\n`;

      // Today's usage
      usageReport += `**Today's Usage:**\n`;
      const commandProgress = this.createProgressBar(
        usage.commandsUsed,
        usage.commandLimit,
      );
      const effectProgress = this.createProgressBar(
        usage.effectsUsed,
        usage.effectLimit,
      );

      usageReport += `• Commands: ${usage.commandsUsed}/${
        usage.commandLimit === -1 ? "∞" : usage.commandLimit
      } ${commandProgress}\n`;
      usageReport += `• Effects: ${usage.effectsUsed}/${
        usage.effectLimit === -1 ? "∞" : usage.effectLimit
      } ${effectProgress}\n\n`;

      // Plan limits comparison
      usageReport += `**Plan Comparison:**\n`;
      usageReport += `📱 **FREE:** 5 commands, 10 effects/day\n`;
      usageReport += `⭐ **PREMIUM:** 25 commands, unlimited effects\n`;
      usageReport += `🚀 **PRO:** 100 commands, unlimited effects + AI\n\n`;

      // Premium features availability
      if (subscription && subscription.status === "active") {
        usageReport += `**Premium Features Available:**\n`;

        if (subscription.tier === "premium") {
          usageReport += `• ✅ Custom commands (${
            usage.remainingCommands === -1 ? 'unlimited' : usage.remainingCommands
          } remaining)\n`;
          usageReport += `• ✅ Advanced visual effects (unlimited)\n`;
          usageReport += `• ✅ Fantasy costume transformations\n`;
          usageReport += `• ❌ AI features (upgrade to PRO)\n`;
        } else if (subscription.tier === "pro") {
          usageReport += `• ✅ Custom commands (${
            usage.remainingCommands === -1 ? 'unlimited' : usage.remainingCommands
          } remaining)\n`;
          usageReport += `• ✅ Advanced visual effects (unlimited)\n`;
          usageReport += `• ✅ Fantasy costume transformations\n`;
          usageReport += `• ✅ AI features (ChatGPT, image analysis)\n`;
        }
      } else {
        usageReport += `**Free Plan Limitations:**\n`;
        usageReport += `• ⚠️ Limited commands (${
          usage.remainingCommands
        } remaining today)\n`;
        usageReport += `• ⚠️ Limited effects (${
          usage.remainingEffects
        } remaining today)\n`;
        usageReport += `• ❌ No custom commands\n`;
        usageReport += `• ❌ No premium effects\n`;
      }

      // Reset time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const hoursUntilReset = Math.ceil(
        (tomorrow.getTime() - Date.now()) / (1000 * 60 * 60),
      );

      usageReport += `\n⏰ **Usage resets in:** ${hoursUntilReset} hour${
        hoursUntilReset !== 1 ? "s" : ""
      }\n`;

      // Upgrade suggestions
      if (!subscription || subscription.status !== "active") {
        usageReport += `\n**💡 Upgrade Suggestion:**\n`;
        if (usage.commandsUsed >= 3) {
          usageReport += `You're using commands frequently! Consider upgrading to **PREMIUM** for 5x more commands and unlimited effects.\n`;
        }
        usageReport += `Use \`!subscribe\` to view premium plans and pricing.`;
      } else if (subscription.tier === "premium" && usage.commandsUsed >= 20) {
        usageReport += `\n**💡 Upgrade Suggestion:**\n`;
        usageReport += `You're a power user! Consider upgrading to **PRO** for 4x more commands and AI features.\n`;
        usageReport += `Use \`!subscribe\` to upgrade your plan.`;
      }

      return message.reply(usageReport);
    } catch (error) {
      this.botClient.logger.error(
        `Failed to fetch usage stats for user ${message.user.id}:`,
        error,
      );
      return message.reply(
        "❌ **Error Loading Usage Statistics**\n" +
          "There was an error loading your usage information. Please try again later.",
      );
    }
  }

  private getStatusEmoji(status: string): string {
    const statusEmojis: Record<string, string> = {
      active: "✅",
      cancelled: "❌",
      past_due: "⚠️",
      expired: "🔒",
      suspended: "⏸️",
      free: "🆓",
    };

    return statusEmojis[status] || "❓";
  }

  private createProgressBar(used: number, limit: number): string {
    if (limit === -1) return ""; // Unlimited

    const percentage = Math.min(100, (used / limit) * 100);
    const barLength = 10;
    const filledLength = Math.round((percentage / 100) * barLength);

    const filled = "█".repeat(filledLength);
    const empty = "░".repeat(barLength - filledLength);

    return `[${filled}${empty}]`;
  }
}
