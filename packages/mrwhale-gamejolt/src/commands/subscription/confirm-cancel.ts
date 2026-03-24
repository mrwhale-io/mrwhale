import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "confirm-cancel",
      description: "Confirm the cancellation of your premium subscription.",
      type: "subscription",
      usage: "<prefix>confirm cancel",
      examples: ["confirm cancel"],
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

      if (!subscription || subscription.status !== "active") {
        return message.reply(
          "❌ **No Active Subscription**\n\n" +
            "You don't have an active subscription to cancel.\n" +
            "Use `!mystatus` to check your current account status.",
        );
      }

      // Attempt to cancel the subscription
      await this.botClient.subscriptionManager.cancelSubscription(
        message.user.id,
      );

      const nextBillingDate = subscription.nextBillingDate
        ? new Date(subscription.nextBillingDate).toLocaleDateString()
        : "end of current billing period";

      return message.reply(
        "✅ **Subscription Successfully Cancelled**\n\n" +
          `Your **${subscription.tier.toUpperCase()}** subscription has been cancelled.\n\n` +
          "**Important Details:**\n" +
          "• No future charges will occur\n" +
          `• Premium features remain active until: ${nextBillingDate}\n` +
          "• You can resubscribe anytime with `!subscribe`\n" +
          "• Your account data and settings are preserved\n\n" +
          "Thank you for being a premium member! We'd love to have you back anytime.",
      );
    } catch (error) {
      this.botClient.logger.error(
        `Failed to confirm cancellation for user ${message.user.id}:`,
        error,
      );
      return message.reply(
        "❌ **Error Processing Cancellation**\n" +
          "There was an unexpected error canceling your subscription. Please try again later or contact support.",
      );
    }
  }
}
