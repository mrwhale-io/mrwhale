import { Message, Content } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { SubscriptionPlan } from "@mrwhale-io/core";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "subscribe",
      description:
        "Upgrade to premium! Get unlimited access to advanced features, exclusive effects, and priority support.",
      type: "utility",
      usage: "<prefix>subscribe [plan] [yearly] <email>",
      examples: [
        "subscribe",
        "subscribe premium user@email.com",
        "subscribe pro yearly user@email.com",
      ],
      cooldown: 3000,
    });
  }

  async action(message: Message, args: string[]): Promise<Message> {
    if (!this.botClient.subscriptionManager) {
      return message.reply(
        "❌ **Subscription system not available**\n" +
          "Premium subscriptions are currently not configured on this bot instance.",
      );
    }

    // Check if user already has an active subscription
    const currentSubscription =
      await this.botClient.subscriptionManager.getUserSubscription(
        message.user.id,
      );
    if (currentSubscription?.status === "active") {
      const tier = currentSubscription.tier;
      const tierIcon = tier === "pro" ? "👑" : "⭐";

      return message.reply(
        `${tierIcon} **You're already subscribed to ${tier.toUpperCase()}!**\n\n` +
          `🗓️ **Next billing:** ${
            currentSubscription.nextBillingDate
              ? new Date(
                  currentSubscription.nextBillingDate,
                ).toLocaleDateString()
              : "Unknown"
          }\n` +
          `💳 **Last payment:** ${
            currentSubscription.lastPaymentDate
              ? new Date(
                  currentSubscription.lastPaymentDate,
                ).toLocaleDateString()
              : "Unknown"
          }\n\n` +
          `Use \`!mystatus\` for more details or \`!cancel\` to cancel your subscription.`,
      );
    }

    // Show available plans if no specific plan requested
    if (args.length === 0) {
      const plans = this.botClient.subscriptionManager.getSubscriptionPlans();

      let plansText = "🎯 **Choose Your Premium Plan:**\n\n";

      plansText += "**🌟 PREMIUM** - Perfect for power users\n";
      plansText += `• Monthly: $${plans.premium_monthly.price}/month\n`;
      plansText += `• Yearly: $${
        plans.premium_yearly.price
      }/year (save ${this.calculatePremiumYearlySavings(plans)})\n`;
      plansText += "• 25 custom commands\n";
      plansText += "• Unlimited image effects\n";
      plansText += "• Advanced visual effects (hologram, glitch, neon)\n";
      plansText += "• Fantasy costumes (wizard, pirate, ninja, etc.)\n";
      plansText += "• Priority support\n\n";

      plansText += "**👑 PRO** - For communities and creators\n";
      plansText += `• Monthly: $${plans.pro_monthly.price}/month\n`;
      plansText += `• Yearly: $${
        plans.pro_yearly.price
      }/year (save ${this.calculateProYearlySavings(plans)})\n`;
      plansText += "• 100 custom commands\n";
      plansText += "• Everything in Premium\n";
      plansText += "• AI-powered effects\n";
      plansText += "• Animated GIF outputs\n";
      plansText += "• Exclusive Pro features\n";
      plansText += "• VIP support\n\n";

      plansText += "**💳 How to Subscribe:**\n";
      plansText += "`!subscribe premium your@email.com` - Monthly premium\n";
      plansText +=
        "`!subscribe premium yearly your@email.com` - Yearly premium\n";
      plansText += "`!subscribe pro your@email.com` - Monthly pro\n";
      plansText += "`!subscribe pro yearly your@email.com` - Yearly pro\n\n";

      plansText +=
        "✨ **Free users get 5 custom commands & 10 daily image effects!**\n\n" +
        "📧 **Note:** You'll need to provide your email for PayPal receipts and notifications.";

      return message.reply(plansText);
    }

    // Parse requested plan and email
    const planArg = args[0]?.toLowerCase();
    const isYearly = args.includes("yearly") || args.includes("year");

    // Check if email is provided
    const emailArg = args.find((arg) => arg.includes("@"));
    if (!emailArg) {
      return message.reply(
        "📧 **Email Required**\n\n" +
          "Please provide your email address for PayPal receipts and notifications.\n\n" +
          "**Usage:**\n" +
          `\`!subscribe ${planArg || "premium"} your@email.com\`\n` +
          `\`!subscribe ${planArg || "premium"} yearly your@email.com\`\n\n` +
          "💡 This email will receive PayPal confirmations and billing updates.\n" +
          "It doesn't need to match your PayPal account email.",
      );
    }

    let planKey: string;
    let planName: string;

    if (planArg === "premium") {
      planKey = isYearly ? "premium_yearly" : "premium_monthly";
      planName = isYearly ? "Premium Yearly" : "Premium Monthly";
    } else if (planArg === "pro") {
      planKey = isYearly ? "pro_yearly" : "pro_monthly";
      planName = isYearly ? "Pro Yearly" : "Pro Monthly";
    } else {
      return message.reply(
        "❌ **Invalid plan!**\n\n" +
          "Available plans: `premium`, `pro`\n" +
          "**Usage:**\n" +
          "`!subscribe premium your@email.com`\n" +
          "`!subscribe premium yearly your@email.com`\n" +
          "`!subscribe pro your@email.com`\n" +
          "`!subscribe pro yearly your@email.com`\n\n" +
          "Use `!subscribe` to see all options.",
      );
    }

    try {
      // Create subscription with PayPal
      const result =
        await this.botClient.subscriptionManager.createSubscription(
          message.user.id,
          planKey,
          emailArg, // User's actual email for PayPal communications
          {
            given: message.user.username || "User",
            surname: message.user.id.toString(),
          },
          `https://mrwhale.io/subscription/success`,
          `https://mrwhale.io/subscription/cancel`,
        );

      const content = new Content()
        .insertText(`🎉 **${planName} Subscription Created!**\n\n`)
        .insertText(
          "Click the link below to complete your payment with PayPal:\n",
        )
        .insertText("• [Complete Payment](" + result.approvalUrl + ")\n")
        .insertText("\n\n💡 **After payment:**\n")
        .insertText("• Your premium features will be activated immediately\n")
        .insertText("• You'll receive a confirmation in this chat\n")
        .insertText("• Use `!mystatus` to check your subscription status\n\n")
        .insertText(
          "🔒 Secure payment processing by PayPal - we never see your payment details!",
        );

      return message.reply(content);
    } catch (error) {
      this.botClient.logger.error(
        `Subscription creation failed for user ${message.user.id}:`,
        error,
      );

      let errorMessage = "❌ **Failed to create subscription**\n\n";

      if (error.message.includes("already has an active subscription")) {
        errorMessage +=
          "You already have an active subscription! Use `!mystatus` to check your current plan.";
      } else {
        errorMessage +=
          "There was an error processing your subscription request. Please try again later or contact support.";
      }

      return message.reply(errorMessage);
    }
  }

  /**
   * Calculate the savings for yearly premium compared to monthly.
   * This is a simple calculation based on the prices of the monthly and yearly plans.
   * @param plans The subscription plans available from the subscription manager.
   */
  private calculatePremiumYearlySavings(
    plans: Record<string, SubscriptionPlan>,
  ) {
    const monthlyPrice = parseFloat(plans.premium_monthly.price);
    const yearlyPrice = parseFloat(plans.premium_yearly.price);

    return Math.round((monthlyPrice * 12 - yearlyPrice) * 100) / 100;
  }

  /**
   * Calculate the savings for yearly pro compared to monthly.
   * This is a simple calculation based on the prices of the monthly and yearly plans.
   * @param plans The subscription plans available from the subscription manager.
   */
  private calculateProYearlySavings(plans: Record<string, SubscriptionPlan>) {
    const monthlyPrice = parseFloat(plans.pro_monthly.price);
    const yearlyPrice = parseFloat(plans.pro_yearly.price);

    return Math.round((monthlyPrice * 12 - yearlyPrice) * 100) / 100;
  }
}
