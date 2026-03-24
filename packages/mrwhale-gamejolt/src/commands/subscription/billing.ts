import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "billing",
      description:
        "View your billing history, upcoming charges, and payment information.",
      type: "subscription",
      usage: "<prefix>billing",
      examples: ["billing"],
      cooldown: 5000,
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

      if (!subscription) {
        return message.reply(
          "💳 **No Billing Information**\n\n" +
            "You don't have any subscription or billing history.\n\n" +
            "**Get Started:**\n" +
            "• Use `!subscribe` to view premium plans\n" +
            "• Choose a plan that fits your needs\n" +
            "• Start enjoying premium features immediately!",
        );
      }

      let billingInfo = `💳 **Billing Information**\n\n`;

      // Current subscription status
      billingInfo += `**Current Plan:** ${subscription.tier.toUpperCase()}\n`;
      billingInfo += `**Status:** ${this.getStatusDisplay(
        subscription.status,
      )}\n`;
      billingInfo += `**PayPal Subscription ID:** ${subscription.paypalSubscriptionId}\n\n`;

      // Billing dates
      if (subscription.status === "active") {
        if (subscription.nextBillingDate) {
          billingInfo += `**Next Billing Date:** ${new Date(
            subscription.nextBillingDate,
          ).toLocaleDateString()}\n`;
          const price = subscription.tier === "premium" ? "$4.99" : "$9.99";
          billingInfo += `**Next Charge:** ${price}/month\n`;
        }

        if (subscription.lastPaymentDate) {
          billingInfo += `**Last Payment Date:** ${new Date(
            subscription.lastPaymentDate,
          ).toLocaleDateString()}\n`;
        }
      } else if (subscription.status === "cancelled") {
        if (subscription.nextBillingDate) {
          billingInfo += `**Premium Access Until:** ${new Date(
            subscription.nextBillingDate,
          ).toLocaleDateString()}\n`;
        }
        billingInfo += `**Status:** No future charges scheduled\n`;
      }

      billingInfo += `\n**Subscription Created:** ${new Date(
        subscription.createdAt,
      ).toLocaleDateString()}\n`;

      // Payment issues
      if (
        subscription.failedPayments &&
        subscription.failedPayments > 0
      ) {
        billingInfo += `\n⚠️ **Payment Issues:** ${subscription.failedPayments} failed payment(s)\n`;
        // Note: Failed payment date tracking would need to be added to the subscription model
      }

      // Usage information  
      const limits = await this.botClient.subscriptionManager.getUserPremiumLimits(
        message.user.id,
      );
      billingInfo += `\n**Plan Limits:**\n`;
      billingInfo += `• Commands: ${
        limits.maxCustomCommands === -1 ? "unlimited" : limits.maxCustomCommands
      } per day\n`;
      billingInfo += `• Effects: ${
        limits.maxImageEffectsPerDay === -1 ? "unlimited" : limits.maxImageEffectsPerDay
      } per day\n`;
      billingInfo += `• Advanced Effects: ${
        limits.hasAdvancedEffects ? "✅" : "❌"
      }\n`;
      billingInfo += `• AI Features: ${
        limits.hasAIEffects ? "✅" : "❌"
      }\n`;

      // Action buttons
      billingInfo += `\n**Account Actions:**\n`;
      if (subscription.status === "active") {
        billingInfo += `• Use \`!cancel\` to cancel your subscription\n`;
      } else if (subscription.status === "cancelled") {
        billingInfo += `• Use \`!subscribe\` to reactivate your subscription\n`;
      }
      billingInfo += `• Use \`!mystatus\` for account overview\n`;

      return message.reply(billingInfo);
    } catch (error) {
      this.botClient.logger.error(
        `Failed to fetch billing info for user ${message.user.id}:`,
        error,
      );
      return message.reply(
        "❌ **Error Loading Billing Information**\n" +
          "There was an error loading your billing information. Please try again later.",
      );
    }
  }

  private getStatusDisplay(status: string): string {
    const statusEmojis: Record<string, string> = {
      active: "✅ Active",
      cancelled: "❌ Cancelled",
      past_due: "⚠️ Payment Required",
      expired: "🔒 Expired",
      suspended: "⏸️ Suspended",
    };

    return statusEmojis[status] || `❓ ${status}`;
  }
}
