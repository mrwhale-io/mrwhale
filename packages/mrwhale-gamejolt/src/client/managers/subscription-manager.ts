import { Op } from "sequelize";
import Stripe from "stripe";

import { SubscriptionPlan } from "@mrwhale-io/core";
import { GameJoltBotClient } from "../gamejolt-bot-client";
import {
  Subscription,
  SubscriptionInstance,
} from "../../database/models/subscription";
import { Usage } from "../../database/models/usage";

/**
 * Stripe configuration for subscription management.
 */
interface StripeConfig {
  /** Stripe secret key (starts with sk_) */
  secretKey: string;
  /** Stripe webhook endpoint secret (starts with whsec_) */
  webhookSecret: string;
  /** Environment: 'test' for development, 'live' for production */
  environment: string;
}

/**
 * Subscription statistics for admin dashboard.
 */
interface SubscriptionStats {
  /** Total number of subscriptions */
  total: number;
  /** Number of active subscriptions */
  active: number;
  /** Number of premium tier users */
  premium: number;
  /** Number of pro tier users */
  pro: number;
  /** Number of cancelled subscriptions */
  cancelled: number;
  /** Number of expired subscriptions */
  expired: number;
  /** Number of subscriptions with failed payments */
  failedPayments: number;
  /** List of recent subscriptions with user ID, tier, creation date, and next billing date */
  recentSubscriptions: Array<{
    userId: number;
    tier: string;
    createdAt: Date;
    nextBillingDate: Date | null;
  }>;
  /** Revenue statistics for the subscriptions */
  revenue: {
    /** Monthly revenue from active subscriptions */
    monthly: number;
    /** Projected revenue based on current subscriptions and billing cycles */
    projected: number;
  };
}

/**
 * Manages user subscriptions, including creation, cancellation, and status checks.
 *
 * This class integrates with the Stripe API to handle subscription billing and status updates.
 */
export class SubscriptionManager {
  private stripe: Stripe;
  private stripeConfig: StripeConfig;

  /**
   * Predefined subscription plans with corresponding Stripe price IDs and details.
   */
  private readonly subscriptionPlans: Record<string, SubscriptionPlan> = {
    premium_monthly: {
      planId: "price_1TH72aC4pYrmkGjJExfzf764", // Replace with your Stripe price IDs
      name: "Premium Monthly",
      tier: "premium",
      price: "2.99",
      currency: "USD",
      interval: "month",
    },
    premium_yearly: {
      planId: "price_1TH72aC4pYrmkGjJ3ZyApfqC",
      name: "Premium Yearly",
      tier: "premium",
      price: "29.99",
      currency: "USD",
      interval: "year",
    },
    pro_monthly: {
      planId: "price_1TH72bC4pYrmkGjJWAKHLtk6",
      name: "Pro Monthly",
      tier: "pro",
      price: "7.99",
      currency: "USD",
      interval: "month",
    },
    pro_yearly: {
      planId: "price_1TH72bC4pYrmkGjJ5KrBmlrS",
      name: "Pro Yearly",
      tier: "pro",
      price: "79.99",
      currency: "USD",
      interval: "year",
    },
  };

  constructor(private bot: GameJoltBotClient, config: StripeConfig) {
    this.stripeConfig = config;
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: "2026-03-25.dahlia",
    });
  }

  /**
   * Create a new subscription for a user using Stripe.
   *
   * This method checks if the user already has an active subscription, then creates a new subscription using the Stripe API and stores it in the database.
   * It returns the subscription ID and checkout URL for the user to complete the subscription process.
   *
   * @param userId - The ID of the user subscribing
   * @param planKey - The key of the subscription plan (e.g., "premium_monthly")
   * @param userEmail - The email address of the user (for Stripe)
   * @param userName - The name of the user (for Stripe customer)
   * @param successUrl - The URL to redirect the user after successful subscription
   * @param cancelUrl - The URL to redirect the user if they cancel the subscription process
   * @returns An object containing the Stripe subscription ID and checkout URL
   */
  async createSubscription(
    userId: number,
    planKey: string,
    userEmail: string,
    userName: { given: string; surname: string },
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ subscriptionId: string; approvalUrl: string }> {
    const plan = this.subscriptionPlans[planKey];
    if (!plan) {
      throw new Error(`Invalid subscription plan: ${planKey}`);
    }

    // Check if user already has an active subscription
    const existingSubscription = await this.getUserSubscription(userId);
    if (existingSubscription && existingSubscription.status === "active") {
      throw new Error("User already has an active subscription");
    }

    try {
      // Create or get existing customer
      const customer = await this.stripe.customers.create({
        email: userEmail,
        name: `${userName.given} ${userName.surname}`,
        metadata: {
          userId: userId.toString(),
          source: "mrwhale-bot",
        },
      });

      // Create checkout session
      const session = await this.stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price: plan.planId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: userId.toString(),
          planKey: planKey,
          tier: plan.tier,
        },
        subscription_data: {
          metadata: {
            userId: userId.toString(),
            planKey: planKey,
            tier: plan.tier,
          },
        },
      });

      // Store pending subscription in database (will be updated via webhook)
      if (existingSubscription) {
        // Update existing subscription record
        await existingSubscription.update({
          stripeSubscriptionId: session.id, // Store checkout session ID initially
          stripePriceId: plan.planId, // Store Stripe price ID
          tier: plan.tier,
          status: "pending", // Will be updated via webhook when payment completes
          startDate: new Date(),
          failedPayments: 0,
          cancelledAt: null, // Clear any previous cancellation date
        });
      } else {
        // Create new subscription record
        await Subscription.create({
          userId,
          stripeSubscriptionId: session.id, // Store checkout session ID initially
          stripePriceId: plan.planId, // Store Stripe price ID
          tier: plan.tier,
          status: "pending", // Will be updated via webhook when payment completes
          startDate: new Date(),
          failedPayments: 0,
        });
      }

      this.bot.logger.info(
        `Created Stripe checkout session ${session.id} for user ${userId}`,
      );

      return {
        subscriptionId: session.id,
        approvalUrl: session.url!,
      };
    } catch (error) {
      this.bot.logger.error("Failed to create Stripe subscription:", error);
      throw error;
    }
  }

  /**
   * Cancel an active subscription for a user using Stripe.
   *
   * This method cancels the user's active subscription using the Stripe API and updates the subscription status in the database.
   *
   * @param userId - The ID of the user whose subscription is to be cancelled
   * @param cancelImmediately - Whether to cancel immediately or at the end of the billing period
   */
  async cancelSubscription(
    userId: number,
    cancelImmediately = false,
  ): Promise<void> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription || subscription.status !== "active") {
      throw new Error("No active subscription found");
    }

    try {
      // Get the actual Stripe subscription ID
      const stripeSubscriptionId = subscription.stripeSubscriptionId;

      if (cancelImmediately) {
        // Cancel immediately
        await this.stripe.subscriptions.cancel(stripeSubscriptionId);

        // Update subscription in database
        await subscription.update({
          status: "cancelled",
          cancelledAt: new Date(),
        });
      } else {
        // Cancel at end of billing period
        await this.stripe.subscriptions.update(stripeSubscriptionId, {
          cancel_at_period_end: true,
        });

        // Update subscription in database to show it's set to cancel
        await subscription.update({
          status: "cancelling", // New status to indicate it will cancel at period end
        });
      }

      this.bot.logger.info(
        `${
          cancelImmediately ? "Cancelled" : "Scheduled cancellation for"
        } subscription ${stripeSubscriptionId} for user ${userId}`,
      );
    } catch (error) {
      this.bot.logger.error("Failed to cancel Stripe subscription:", error);
      throw error;
    }
  }

  /**
   * Get the user's current subscription from the database.
   * Returns the most recent subscription record for the user, or null if no subscription exists.
   *
   * @param userId - The ID of the user whose subscription is being retrieved.
   */
  async getUserSubscription(
    userId: number,
  ): Promise<SubscriptionInstance | null> {
    try {
      return await Subscription.findOne({
        where: { userId },
        order: [["createdAt", "DESC"]], // Get most recent subscription
      });
    } catch (error) {
      this.bot.logger.error(
        `Failed to get subscription for user ${userId}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Check if user has premium access based on their subscription status and tier.
   *
   * @param userId - The ID of the user to check
   */
  async isPremiumUser(userId: number): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    return (
      subscription?.status === "active" &&
      (subscription.tier === "premium" || subscription.tier === "pro")
    );
  }

  /**
   * Get the user's subscription tier (free, premium, or pro) based on their active subscription.
   *
   * @param userId - The ID of the user whose subscription tier is being retrieved.
   */
  async getUserSubscriptionTier(
    userId: number,
  ): Promise<"free" | "premium" | "pro"> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription || subscription.status !== "active") {
      return "free";
    }
    return subscription.tier;
  }

  /**
   * Get the user's premium limits based on their subscription tier.
   *
   * @param userId - The ID of the user whose premium limits are being retrieved.
   * @returns An object containing the user's limits for custom commands, image effects, and access to advanced features based on their subscription tier.
   */
  async getUserPremiumLimits(userId: number): Promise<{
    maxCustomCommands: number;
    maxImageEffectsPerDay: number;
    hasAdvancedEffects: boolean;
    hasAIEffects: boolean;
    hasAnimatedEffects: boolean;
  }> {
    const tier = await this.getUserSubscriptionTier(userId);

    switch (tier) {
      case "free":
        return {
          maxCustomCommands: 5,
          maxImageEffectsPerDay: 10,
          hasAdvancedEffects: false,
          hasAIEffects: false,
          hasAnimatedEffects: false,
        };

      case "premium":
        return {
          maxCustomCommands: 25,
          maxImageEffectsPerDay: -1, // Unlimited
          hasAdvancedEffects: true,
          hasAIEffects: false,
          hasAnimatedEffects: false,
        };

      case "pro":
        return {
          maxCustomCommands: 100,
          maxImageEffectsPerDay: -1, // Unlimited
          hasAdvancedEffects: true,
          hasAIEffects: true,
          hasAnimatedEffects: true,
        };

      default:
        return {
          maxCustomCommands: 5,
          maxImageEffectsPerDay: 10,
          hasAdvancedEffects: false,
          hasAIEffects: false,
          hasAnimatedEffects: false,
        };
    }
  }

  /**
   * Track user usage for premium features to enforce limits.
   * This method should be called whenever a user uses a premium feature (e.g., creates a custom command or applies an image effect) to increment their usage count for the day.
   *
   * @param userId - The ID of the user whose usage is being tracked
   * @param usageType - The type of usage being tracked (e.g., "imageEffects" or "customCommands")
   */
  async trackUsage(
    userId: number,
    usageType: "imageEffects" | "customCommands",
  ): Promise<void> {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    try {
      const [usage] = await Usage.findOrCreate({
        where: { userId, date: today },
        defaults: {
          userId,
          date: today,
          imageEffectsCount: 0,
          customCommandsCount: 0,
        },
      });

      if (usageType === "imageEffects") {
        await usage.increment("imageEffectsCount");
      } else if (usageType === "customCommands") {
        await usage.increment("customCommandsCount");
      }
    } catch (error) {
      this.bot.logger.error(`Failed to track usage for user ${userId}:`, error);
    }
  }

  /**
   * Check if a user has exceeded their usage limits for premium features based on their subscription tier.
   * This method should be called before allowing a user to use a premium feature to ensure they have not exceeded their daily limits.
   *
   * @param userId - The ID of the user being checked
   * @param usageType - The type of usage being checked (e.g., "imageEffects" or "customCommands")
   * @return A boolean indicating whether the user has exceeded their usage limit (true if they have exceeded the limit, false if they are within the limit)
   */
  async checkUsageLimit(
    userId: number,
    usageType: "imageEffects" | "customCommands",
  ): Promise<boolean> {
    const limits = await this.getUserPremiumLimits(userId);

    // Unlimited for premium/pro users
    if (usageType === "imageEffects" && limits.maxImageEffectsPerDay === -1) {
      return false;
    }

    const today = new Date().toISOString().split("T")[0];

    try {
      const usage = await Usage.findOne({
        where: { userId, date: today },
      });

      if (!usage) {
        return false; // No usage today, hasn't exceeded limit
      }

      if (usageType === "imageEffects") {
        return usage.imageEffectsCount >= limits.maxImageEffectsPerDay;
      } else if (usageType === "customCommands") {
        return usage.customCommandsCount >= limits.maxCustomCommands;
      }

      return false;
    } catch (error) {
      this.bot.logger.error(
        `Failed to check usage limit for user ${userId}:`,
        error,
      );
      return false; // Allow on error
    }
  }

  /**
   * Handle incoming Stripe webhook events to update subscription statuses accordingly.
   * This method processes various subscription-related events such as activation, cancellation, payment failures, and updates the subscription records in the database based on the event data.
   *
   * @param body - The raw webhook body (needed for signature verification)
   * @param signature - The Stripe signature header for webhook verification
   */
  async handleWebhook(body: string, signature: string): Promise<void> {
    try {
      // Verify webhook signature
      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        this.stripeConfig.webhookSecret,
      );

      // this.bot.logger.info(
      //   `Processing Stripe webhook: ${event.type} for ${event.data.object.id}`,
      // );
      console.log(event);

      switch (event.type) {
        case "checkout.session.completed":
          await this.handleCheckoutCompleted(
            event.data.object as Stripe.Checkout.Session,
          );
          break;

        case "customer.subscription.created":
          await this.handleSubscriptionCreated(
            event.data.object as Stripe.Subscription,
          );
          break;

        case "customer.subscription.updated":
          await this.handleSubscriptionUpdated(
            event.data.object as Stripe.Subscription,
          );
          break;

        case "customer.subscription.deleted":
          await this.handleSubscriptionDeleted(
            event.data.object as Stripe.Subscription,
          );
          break;

        case "invoice.payment_succeeded":
          await this.handlePaymentSucceeded(
            event.data.object as Stripe.Invoice,
          );
          break;

        case "invoice.payment_failed":
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          this.bot.logger.info(`Unhandled webhook event: ${event.type}`);
      }
    } catch (error) {
      this.bot.logger.error("Error processing Stripe webhook:", error);
      throw error;
    }
  }

  /**
   * Handle successful checkout session completion.
   */
  private async handleCheckoutCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    if (session.mode !== "subscription") return;

    const userId = parseInt(session.metadata?.userId || "0");
    if (!userId) {
      this.bot.logger.warn(`Checkout completed without user ID: ${session.id}`);
      return;
    }

    // Update the subscription record with the actual subscription ID
    const subscription = await Subscription.findOne({
      where: { stripeSubscriptionId: session.id, userId },
    });

    if (subscription && session.subscription) {
      await subscription.update({
        stripeSubscriptionId: session.subscription as string,
        status: "active",
        startDate: new Date(),
        lastPaymentDate: new Date(),
        failedPayments: 0,
      });

      this.bot.logger.info(
        `Checkout completed and subscription activated for user ${userId}`,
      );
    }
  }

  /**
   * Handle subscription creation (when payment is successful).
   */
  private async handleSubscriptionCreated(
    stripeSubscription: Stripe.Subscription,
  ): Promise<void> {
    const userId = parseInt(stripeSubscription.metadata?.userId || "0");
    if (!userId) {
      this.bot.logger.warn(
        `Subscription created without user ID: ${stripeSubscription.id}`,
      );
      return;
    }

    const subscription = await Subscription.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id, userId },
    });

    if (subscription) {
      // Calculate next billing date from subscription items
      let nextBillingDate: Date | null = null;
      if (
        stripeSubscription.status === "active" &&
        stripeSubscription.items?.data[0]?.price?.recurring
      ) {
        const interval =
          stripeSubscription.items.data[0].price.recurring.interval;
        const intervalCount =
          stripeSubscription.items.data[0].price.recurring.interval_count || 1;

        const startDate = new Date(stripeSubscription.created * 1000);
        if (interval === "month") {
          startDate.setMonth(startDate.getMonth() + intervalCount);
        } else if (interval === "year") {
          startDate.setFullYear(startDate.getFullYear() + intervalCount);
        } else if (interval === "week") {
          startDate.setDate(startDate.getDate() + 7 * intervalCount);
        } else if (interval === "day") {
          startDate.setDate(startDate.getDate() + intervalCount);
        }
        nextBillingDate = startDate;
      }

      await subscription.update({
        status: "active",
        startDate: new Date(stripeSubscription.created * 1000),
        nextBillingDate,
        failedPayments: 0,
      });

      this.bot.logger.info(
        `Subscription ${stripeSubscription.id} activated for user ${userId}`,
      );
    }
  }

  /**
   * Handle subscription updates (status changes, etc.).
   */
  private async handleSubscriptionUpdated(
    stripeSubscription: Stripe.Subscription,
  ): Promise<void> {
    const userId = parseInt(stripeSubscription.metadata?.userId || "0");
    if (!userId) return;

    const subscription = await Subscription.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id, userId },
    });

    if (!subscription) return;

    let status:
      | "active"
      | "pending"
      | "cancelled"
      | "cancelling"
      | "past_due"
      | "suspended"
      | "expired";
    let cancelledAt: Date | null = null;

    // Map Stripe statuses to our model's status enum
    switch (stripeSubscription.status) {
      case "active":
        status = "active";
        break;
      case "canceled": // Stripe uses "canceled" not "cancelled"
        status = "cancelled";
        cancelledAt = new Date();
        break;
      case "past_due":
        status = "past_due";
        break;
      case "unpaid":
        status = "suspended";
        break;
      case "incomplete":
      case "incomplete_expired":
        status = "pending"; // Map incomplete statuses to pending
        break;
      case "trialing":
        status = "active"; // Treat trial as active
        break;
      case "paused":
        status = "suspended"; // Map paused to suspended
        break;
      default:
        // Handle any unknown Stripe statuses by defaulting to suspended
        this.bot.logger.warn(
          `Unknown Stripe subscription status: ${stripeSubscription.status}, defaulting to suspended`,
        );
        status = "suspended";
    }

    // Calculate next billing date if subscription is active
    let nextBillingDate: Date | null = null;
    if (
      status === "active" &&
      stripeSubscription.items?.data[0]?.price?.recurring
    ) {
      const interval =
        stripeSubscription.items.data[0].price.recurring.interval;
      const intervalCount =
        stripeSubscription.items.data[0].price.recurring.interval_count || 1;

      const now = new Date();
      if (interval === "month") {
        now.setMonth(now.getMonth() + intervalCount);
      } else if (interval === "year") {
        now.setFullYear(now.getFullYear() + intervalCount);
      } else if (interval === "week") {
        now.setDate(now.getDate() + 7 * intervalCount);
      } else if (interval === "day") {
        now.setDate(now.getDate() + intervalCount);
      }
      nextBillingDate = now;
    }

    await subscription.update({
      status: status,
      cancelledAt,
      nextBillingDate,
    });

    this.bot.logger.info(
      `Subscription ${stripeSubscription.id} updated to ${status} for user ${userId}`,
    );
  }

  /**
   * Handle subscription deletion/cancellation.
   */
  private async handleSubscriptionDeleted(
    stripeSubscription: Stripe.Subscription,
  ): Promise<void> {
    const userId = parseInt(stripeSubscription.metadata?.userId || "0");
    if (!userId) return;

    const subscription = await Subscription.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id, userId },
    });

    if (subscription) {
      await subscription.update({
        status: "cancelled",
        cancelledAt: new Date(),
      });

      this.bot.logger.info(
        `Subscription ${stripeSubscription.id} cancelled for user ${userId}`,
      );
    }
  }

  /**
   * Handle successful payment.
   */
  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    // Type assertion needed as subscription field exists in runtime but not in TS definitions
    const invoiceWithSubscription = invoice as any;
    if (!invoice || !invoiceWithSubscription.subscription) return;

    const subscriptionId =
      typeof invoiceWithSubscription.subscription === "string"
        ? invoiceWithSubscription.subscription
        : invoiceWithSubscription.subscription.id;

    const stripeSubscription = await this.stripe.subscriptions.retrieve(
      subscriptionId,
    );

    const userId = parseInt(stripeSubscription.metadata?.userId || "0");
    if (!userId) return;

    const subscription = await Subscription.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id, userId },
    });

    if (subscription) {
      // Get payment date from invoice
      const paymentDate = new Date(invoice.created * 1000);

      // Calculate next billing date - add billing interval to current date
      let nextBillingDate: Date | null = null;
      if (
        stripeSubscription.status === "active" &&
        stripeSubscription.items?.data[0]?.price?.recurring
      ) {
        const interval =
          stripeSubscription.items.data[0].price.recurring.interval;
        const intervalCount =
          stripeSubscription.items.data[0].price.recurring.interval_count || 1;

        const next = new Date();
        if (interval === "month") {
          next.setMonth(next.getMonth() + intervalCount);
        } else if (interval === "year") {
          next.setFullYear(next.getFullYear() + intervalCount);
        } else if (interval === "week") {
          next.setDate(next.getDate() + 7 * intervalCount);
        } else if (interval === "day") {
          next.setDate(next.getDate() + intervalCount);
        }
        nextBillingDate = next;
      }

      await subscription.update({
        status: "active",
        lastPaymentDate: paymentDate,
        nextBillingDate,
        failedPayments: 0,
      });

      this.bot.logger.info(
        `Payment succeeded for subscription ${stripeSubscription.id}, user ${userId}`,
      );
    }
  }

  /**
   * Handle failed payment.
   */
  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    // Type assertion needed as subscription field exists in runtime but not in TS definitions
    const invoiceWithSubscription = invoice as any;
    if (!invoice || !invoiceWithSubscription.subscription) return;

    const subscriptionId =
      typeof invoiceWithSubscription.subscription === "string"
        ? invoiceWithSubscription.subscription
        : invoiceWithSubscription.subscription.id;

    const stripeSubscription = await this.stripe.subscriptions.retrieve(
      subscriptionId,
    );

    const userId = parseInt(stripeSubscription.metadata?.userId || "0");
    if (!userId) return;

    const subscription = await Subscription.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id, userId },
    });

    if (subscription) {
      await subscription.update({
        failedPayments: subscription.failedPayments + 1,
        status: "past_due",
      });

      this.bot.logger.warn(
        `Payment failed for subscription ${
          stripeSubscription.id
        }, user ${userId} (${subscription.failedPayments + 1} failures)`,
      );
    }
  }

  /**
   * Get the predefined subscription plans with their details.
   * This method returns the available subscription plans that users can choose from when subscribing to premium features. Each plan includes information such as the Stripe price ID, name, tier, price, currency, and billing interval.
   *
   * @returns An object containing the subscription plans keyed by their identifiers (e.g., "premium_monthly", "pro_yearly") with their corresponding details.
   */
  getSubscriptionPlans(): Record<string, SubscriptionPlan> {
    return this.subscriptionPlans;
  }

  /**
   * Get the user's current usage and remaining limits for today.
   * This method returns the user's usage statistics for the current day along with their tier-based limits.
   *
   * @param userId - The ID of the user whose usage information is being retrieved.
   * @returns An object containing today's usage counts and limits based on the user's subscription tier.
   */
  async getRemainingUsage(userId: number): Promise<{
    commandsUsed: number;
    effectsUsed: number;
    commandLimit: number;
    effectLimit: number;
    remainingCommands: number;
    remainingEffects: number;
  }> {
    try {
      const limits = await this.getUserPremiumLimits(userId);
      const today = new Date().toISOString().split("T")[0];

      // Get today's usage from database
      const usage = await Usage.findOne({
        where: { userId, date: today },
      });

      const commandsUsed = usage ? usage.customCommandsCount : 0;
      const effectsUsed = usage ? usage.imageEffectsCount : 0;

      const commandLimit = limits.maxCustomCommands;
      const effectLimit = limits.maxImageEffectsPerDay;

      return {
        commandsUsed,
        effectsUsed,
        commandLimit,
        effectLimit,
        remainingCommands:
          commandLimit === -1 ? -1 : Math.max(0, commandLimit - commandsUsed),
        remainingEffects:
          effectLimit === -1 ? -1 : Math.max(0, effectLimit - effectsUsed),
      };
    } catch (error) {
      this.bot.logger.error(
        `Failed to get remaining usage for user ${userId}:`,
        error,
      );
      // Return default free tier limits on error
      return {
        commandsUsed: 0,
        effectsUsed: 0,
        commandLimit: 5,
        effectLimit: 10,
        remainingCommands: 5,
        remainingEffects: 10,
      };
    }
  }

  /**
   * Get subscription statistics for admin dashboard.
   * This method retrieves various subscription metrics for display on the admin dashboard, including total subscriptions, active subscriptions, premium and pro users, cancelled and expired subscriptions, failed payments, recent subscriptions, and revenue projections.
   *
   * @returns An object containing the subscription statistics.
   */
  async getSubscriptionStats(): Promise<SubscriptionStats> {
    try {
      const [
        totalSubscriptions,
        activeSubscriptions,
        premiumUsers,
        proUsers,
        cancelledSubscriptions,
        expiredSubscriptions,
      ] = await Promise.all([
        Subscription.count(),
        Subscription.count({ where: { status: "active" } }),
        Subscription.count({
          where: { tier: "premium", status: "active" },
        }),
        Subscription.count({ where: { tier: "pro", status: "active" } }),
        Subscription.count({ where: { status: "cancelled" } }),
        Subscription.count({ where: { status: "expired" } }),
      ]);

      const recentSubscriptions = await Subscription.findAll({
        where: { status: "active" },
        order: [["createdAt", "DESC"]],
        limit: 10,
      });

      const failedPayments = await Subscription.count({
        where: {
          failedPayments: { [Op.gt]: 0 },
        },
      });

      return {
        total: totalSubscriptions,
        active: activeSubscriptions,
        premium: premiumUsers,
        pro: proUsers,
        cancelled: cancelledSubscriptions,
        expired: expiredSubscriptions,
        failedPayments,
        recentSubscriptions: recentSubscriptions.map((sub) => ({
          userId: sub.userId,
          tier: sub.tier,
          createdAt: sub.createdAt,
          nextBillingDate: sub.nextBillingDate,
        })),
        revenue: {
          monthly: premiumUsers * 2.99 + proUsers * 7.99, // Updated to correct Stripe pricing
          projected: (premiumUsers * 2.99 + proUsers * 7.99) * 12,
        },
      };
    } catch (error) {
      this.bot.logger.error("Error fetching subscription statistics:", error);
      throw error;
    }
  }
}
