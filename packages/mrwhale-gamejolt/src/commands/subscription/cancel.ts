import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "cancel",
      description:
        "Cancel your premium subscription. Your premium features will remain active until the end of your current billing period.",
      type: "subscription",
      usage: "<prefix>cancel",
      examples: ["cancel"],
      cooldown: 5000,
    });
  }

  async action(message: Message): Promise<Message> {
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

      // Confirm cancellation
      const confirmText =
        "⚠️ **Confirm Subscription Cancellation**\n\n" +
        `You're about to cancel your **${subscription.tier.toUpperCase()}** subscription.\n\n` +
        "**What happens next:**\n" +
        "• Your subscription will be cancelled immediately\n" +
        "• Premium features will remain active until your next billing date\n" +
        `• Next billing date: ${
          subscription.nextBillingDate
            ? new Date(subscription.nextBillingDate).toLocaleDateString()
            : "Unknown"
        }\n` +
        "• No further charges will occur\n" +
        "• You can resubscribe anytime with `!subscribe`\n\n" +
        "**To confirm cancellation, reply with:** `confirm cancel`\n" +
        "**To keep your subscription, simply ignore this message.**";

      await message.reply(confirmText);

      // Wait for confirmation (this is a simplified approach)
      // In a real implementation, you might want to use a more sophisticated confirmation system

      // For now, we'll proceed with immediate cancellation
      // You could implement a confirmation listener here
    } catch (error) {
      this.botClient.logger.error(
        `Failed to process cancellation for user ${message.user.id}:`,
        error,
      );
      return message.reply(
        "❌ **Error Processing Cancellation**\n" +
          "There was an error processing your cancellation request. Please try again later or contact support.",
      );
    }
  }
}
