import { Message, Content } from "@mrwhale-io/gamejolt-client";
import { SubscriptionPlan } from "@mrwhale-io/core";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { SubscriptionInstance } from "../../database/models/subscription";

const STRIPE_SUCCESS_URL = "https://mrwhale.io/subscription/success";
const STRIPE_CANCEL_URL = "https://mrwhale.io/subscription/cancel";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "subscribe",
      description:
        "Upgrade to premium! Get unlimited access to advanced features, exclusive effects, and priority support.",
      type: "subscription",
      usage: "<prefix>subscribe [plan] [yearly] <email>",
      examples: [
        "subscribe",
        "subscribe premium, user@email.com",
        "subscribe pro, yearly, user@email.com",
      ],
      cooldown: 3000,
    });
  }

  async action(message: Message, args: string[]): Promise<Message> {
    // Check if user already has an active subscription
    const currentSubscription =
      await this.botClient.subscriptionManager.getUserSubscription(
        message.user.id,
      );

    if (currentSubscription?.status === "active") {
      return this.handleActiveSubscription(currentSubscription, message);
    }

    // Check for pending subscriptions - help them complete it
    if (currentSubscription?.status === "pending") {
      return this.handlePendingSubscription(currentSubscription, message, args);
    }

    // Show available plans if no specific plan requested
    if (args.length === 0) {
      return this.showAvailablePlans(message);
    }

    // Parse requested plan and email
    const planArg = args[0]?.toLowerCase();
    const isYearly = args.includes("yearly") || args.includes("year");

    // Check if email is provided
    const emailArg = args.find((arg) => arg.includes("@"));
    if (!emailArg) {
      return message.reply(
        "📧 **Email Required**\n\n" +
          "Please provide your email address for Stripe receipts and notifications.\n\n" +
          "**Usage:**\n" +
          `\`!subscribe ${planArg || "premium"} your@email.com\`\n` +
          `\`!subscribe ${planArg || "premium"} yearly your@email.com\`\n\n` +
          "💡 This email will receive Stripe confirmations and billing updates.",
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
      // Create subscription with Stripe
      const result =
        await this.botClient.subscriptionManager.createSubscription(
          message.user.id,
          planKey,
          emailArg, // User's actual email for Stripe communications
          {
            given: message.user.username,
            surname: message.user.id.toString(),
          },
          STRIPE_SUCCESS_URL,
          STRIPE_CANCEL_URL,
        );

      const content = new Content().insertText(
        `🎉 ${planName} Ready!\n💳 Complete Payment: ${result.approvalUrl}\n✅ Premium features activate immediately after payment\n🔒 Secure Stripe checkout`,
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

  private showAvailablePlans(message: Message) {
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
      "📧 **Note:** You'll need to provide your email for Stripe receipts and notifications.";

    return message.reply(plansText);
  }

  private handleActiveSubscription(
    currentSubscription: SubscriptionInstance,
    message: Message,
  ) {
    const tier = currentSubscription.tier;
    const tierIcon = tier === "pro" ? "👑" : "⭐";

    return message.reply(
      `${tierIcon} **You're already subscribed to ${tier.toUpperCase()}!**\n\n` +
        `🗓️ **Next billing:** ${
          currentSubscription.nextBillingDate
            ? new Date(currentSubscription.nextBillingDate).toLocaleDateString()
            : "Unknown"
        }\n` +
        `💳 **Last payment:** ${
          currentSubscription.lastPaymentDate
            ? new Date(currentSubscription.lastPaymentDate).toLocaleDateString()
            : "Unknown"
        }\n\n` +
        `Use \`!mystatus\` for more details or \`!cancel\` to cancel your subscription.`,
    );
  }

  private async handlePendingSubscription(
    currentSubscription: SubscriptionInstance,
    message: Message,
    args: string[],
  ) {
    // Email is still required for pending subscriptions
    const emailArg = args.find((arg) => arg.includes("@"));
    if (!emailArg) {
      return message.reply(
        `⏳ **Complete Your ${currentSubscription.tier.toUpperCase()} Subscription**\n\n` +
          "📧 **Email Required**\n" +
          "Please provide your email address to get a fresh payment link.\n\n" +
          "**Usage:**\n" +
          `\`!subscribe ${currentSubscription.tier} your@email.com\`\n\n` +
          "💡 This email will receive Stripe confirmations and billing updates.",
      );
    }

    try {
      // Create a new checkout session for the pending subscription
      const result =
        await this.botClient.subscriptionManager!.createSubscription(
          message.user.id,
          currentSubscription.tier === "premium"
            ? currentSubscription.stripePriceId.includes("yearly")
              ? "premium_yearly"
              : "premium_monthly"
            : currentSubscription.stripePriceId.includes("yearly")
            ? "pro_yearly"
            : "pro_monthly",
          emailArg, // Use the provided email
          {
            given: message.user.username,
            surname: message.user.id.toString(),
          },
          STRIPE_SUCCESS_URL,
          STRIPE_CANCEL_URL,
        );

      const content = new Content().insertText(
        `⏳ Complete Your ${currentSubscription.tier.toUpperCase()} Subscription\n💳 Complete Payment: ${
          result.approvalUrl
        }\n✅ Premium features activate immediately after payment\n🔒 Secure Stripe checkout`,
      );

      return message.reply(content);
    } catch (error) {
      return message.reply(
        `⏳ **You have a pending ${currentSubscription.tier} subscription!**\n\n` +
          `Use \`!subscribe ${currentSubscription.tier} your@email.com\` to get a new payment link.`,
      );
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
