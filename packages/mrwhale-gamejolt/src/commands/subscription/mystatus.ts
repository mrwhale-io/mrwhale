import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "mystatus",
      description:
        "Check your subscription status, usage limits, and premium features.",
      type: "subscription",
      usage: "<prefix>mystatus",
      examples: ["mystatus"],
      cooldown: 3000,
    });
  }

  async action(message: Message): Promise<Message> {
    try {
      const subscription =
        await this.botClient.subscriptionManager.getUserSubscription(
          message.user.id,
        );
      const limits =
        await this.botClient.subscriptionManager.getUserPremiumLimits(
          message.user.id,
        );

      let statusText = `👤 **@${message.user.username}'s Account Status**\n\n`;

      if (!subscription) {
        // No subscription - free tier user
        statusText += "🆓 **FREE TIER**\n\n";
        statusText += "**Current Limits:**\n";
        statusText += `• Custom Commands: ${limits.maxCustomCommands}\n`;
        statusText += `• Daily Image Effects: ${limits.maxImageEffectsPerDay}\n`;
        statusText += `• Advanced Effects: ${
          limits.hasAdvancedEffects ? "✅" : "❌"
        }\n`;
        statusText += `• AI Effects: ${limits.hasAIEffects ? "✅" : "❌"}\n`;
        statusText += `• Animated Effects: ${
          limits.hasAnimatedEffects ? "✅" : "❌"
        }\n\n`;

        statusText += "🎯 **Upgrade to Premium for:**\n";
        statusText += "• 25+ custom commands\n";
        statusText += "• Unlimited daily effects\n";
        statusText += "• Advanced visual effects\n";
        statusText += "• Fantasy costumes\n";
        statusText += "• Priority support\n\n";
        statusText += "Use `!subscribe` to see upgrade options!";
      } else if (subscription.status === "expired") {
        // Expired subscription - show as free tier
        statusText += "🆓 **FREE TIER** (Subscription Expired)\n\n";
        statusText += `⏰ **Your ${subscription.tier.toUpperCase()} subscription expired**\n`;
        statusText += `• Expired: ${new Date(
          subscription.startDate,
        ).toLocaleDateString()}\n\n`;

        statusText += "**Current Limits:**\n";
        statusText += `• Custom Commands: ${limits.maxCustomCommands}\n`;
        statusText += `• Daily Image Effects: ${limits.maxImageEffectsPerDay}\n`;
        statusText += `• Advanced Effects: ${
          limits.hasAdvancedEffects ? "✅" : "❌"
        }\n`;
        statusText += `• AI Effects: ${limits.hasAIEffects ? "✅" : "❌"}\n`;
        statusText += `• Animated Effects: ${
          limits.hasAnimatedEffects ? "✅" : "❌"
        }\n\n`;

        statusText += "💡 **Resubscribe to restore premium features:**\n";
        statusText += "Use `!subscribe` to see premium plans!";
      } else {
        // Has subscription (active, past_due, cancelled, suspended)
        const tierIcon = subscription.tier === "pro" ? "👑" : "⭐";
        const tierName = subscription.tier.toUpperCase();

        statusText += `${tierIcon} **${tierName} SUBSCRIBER**\n\n`;

        statusText += "**Subscription Details:**\n";
        statusText += `• Plan: ${tierName}\n`;
        statusText += `• Status: ${this.getStatusIcon(
          subscription.status,
        )} ${subscription.status.toUpperCase()}\n`;
        statusText += `• Started: ${new Date(
          subscription.startDate,
        ).toLocaleDateString()}\n`;

        if (subscription.nextBillingDate) {
          statusText += `• Next Billing: ${new Date(
            subscription.nextBillingDate,
          ).toLocaleDateString()}\n`;
        }

        if (subscription.lastPaymentDate) {
          statusText += `• Last Payment: ${new Date(
            subscription.lastPaymentDate,
          ).toLocaleDateString()}\n`;
        }

        statusText += "\n**Your Premium Features:**\n";
        statusText += `• Custom Commands: ${
          limits.maxCustomCommands === -1
            ? "Unlimited"
            : limits.maxCustomCommands
        }\n`;
        statusText += `• Daily Image Effects: ${
          limits.maxImageEffectsPerDay === -1
            ? "Unlimited"
            : limits.maxImageEffectsPerDay
        }\n`;
        statusText += `• Advanced Effects: ${
          limits.hasAdvancedEffects ? "✅" : "❌"
        }\n`;
        statusText += `• AI Effects: ${limits.hasAIEffects ? "✅" : "❌"}\n`;
        statusText += `• Animated Effects: ${
          limits.hasAnimatedEffects ? "✅" : "❌"
        }\n\n`;

        // Show today's usage
        // const today = new Date().toISOString().split('T')[0];

        statusText += "**Today's Usage:**\n";
        // Note: This is a simplified version - you'd want to fetch actual usage counts
        statusText += "• Image Effects: Check individual commands for usage\n";
        statusText +=
          "• Custom Commands: Check `!listcommands` for your commands\n\n";

        statusText += "**Manage Subscription:**\n";
        statusText += "• `!cancel` - Cancel subscription\n";
        statusText += "• Need help? Contact support\n";

        // Status-specific warnings
        if (subscription.status === "past_due") {
          statusText +=
            "\n⚠️ **Payment Issue:** Your payment failed. Please update your payment method to avoid service interruption.";
        } else if (subscription.status === "cancelled") {
          statusText +=
            "\n📅 **Cancelled:** Your subscription is cancelled and will expire on your next billing date. Premium features remain active until then.";
        } else if (subscription.status === "suspended") {
          statusText +=
            "\n🚫 **Suspended:** Your subscription is temporarily suspended. Contact support for assistance.";
        }
      }

      return message.reply(statusText);
    } catch (error) {
      this.botClient.logger.error(
        `Failed to get status for user ${message.user.id}:`,
        error,
      );
      return message.reply(
        "❌ **Error getting subscription status**\n" +
          "There was an error checking your account. Please try again later.",
      );
    }
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case "active":
        return "✅";
      case "cancelled":
        return "❌";
      case "past_due":
        return "⚠️";
      case "suspended":
        return "🚫";
      case "expired":
        return "⏰";
      default:
        return "❓";
    }
  }
}
