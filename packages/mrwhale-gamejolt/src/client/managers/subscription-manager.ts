import { Op } from "sequelize";

import { GameJoltBotClient } from "../gamejolt-bot-client";
import {
  Subscription,
  SubscriptionInstance,
} from "../../database/models/subscription";
import { Usage } from "../../database/models/usage";
import {
  HttpStatusCode,
  PayPalAccessToken,
  PayPalConfig,
  PayPalSubscriptionRequest,
  PayPalSubscriptionResponse,
  PayPalWebhookEvent,
  SubscriptionPlan,
} from "@mrwhale-io/core";

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
 * This class integrates with the PayPal API to handle subscription billing and status updates.
 */
export class SubscriptionManager {
  private paypalConfig: PayPalConfig;
  private accessToken?: PayPalAccessToken;
  private tokenExpiry?: number;

  /**
   * Predefined subscription plans with corresponding PayPal plan IDs and details.
   */
  private readonly subscriptionPlans: Record<string, SubscriptionPlan> = {
    premium_monthly: {
      planId: "P-5ML4271244454362WXNWU5NQ", // Replace with your actual PayPal plan IDs
      name: "Premium Monthly",
      tier: "premium",
      price: "2.99",
      currency: "USD",
      interval: "month",
    },
    premium_yearly: {
      planId: "P-1GJ4485843924560BXNWU5NQ",
      name: "Premium Yearly",
      tier: "premium",
      price: "29.99",
      currency: "USD",
      interval: "year",
    },
    pro_monthly: {
      planId: "P-0WJ4485843924566CXNWU5NQ",
      name: "Pro Monthly",
      tier: "pro",
      price: "7.99",
      currency: "USD",
      interval: "month",
    },
    pro_yearly: {
      planId: "P-3DJ4485843924561DXNWU5NQ",
      name: "Pro Yearly",
      tier: "pro",
      price: "79.99",
      currency: "USD",
      interval: "year",
    },
  };

  constructor(private bot: GameJoltBotClient, config: PayPalConfig) {
    this.paypalConfig = config;
  }

  /**
   * Get PayPal access token for API calls.
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken.access_token;
    }

    const baseUrl = this.fetchApiEndpoint();

    const auth = Buffer.from(
      `${this.paypalConfig.clientId}:${this.paypalConfig.clientSecret}`,
    ).toString("base64");

    try {
      const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
          "Accept-Language": "en_US",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });

      if (!response.ok) {
        throw new Error(
          `PayPal auth failed: ${response.status} ${response.statusText}`,
        );
      }

      const tokenData: PayPalAccessToken = await response.json();
      this.accessToken = tokenData;
      this.tokenExpiry = Date.now() + tokenData.expires_in * 1000 - 60000; // Refresh 1 minute early

      return tokenData.access_token;
    } catch (error) {
      this.bot.logger.error("Failed to get PayPal access token:", error);
      throw error;
    }
  }

  /**
   * Fetch the appropriate PayPal API endpoint based on the environment configuration.
   * Uses the sandbox endpoint for development and the live endpoint for production.
   */
  private fetchApiEndpoint() {
    return this.paypalConfig.environment === "sandbox"
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com";
  }

  /**
   * Make a PayPal API request with proper authentication and error handling.
   *
   * @param endpoint - The API endpoint path (e.g., "/v1/billing/subscriptions")
   * @param method - HTTP method (GET, POST, PUT, DELETE)
   * @param body - Request body for POST/PUT requests
   * @param accessToken - PayPal access token for authentication
   * @returns Parsed JSON response from PayPal API
   */
  private async makePayPalRequest(
    endpoint: string,
    method: string,
    body?: any,
    accessToken?: string,
  ): Promise<any> {
    const token = accessToken || (await this.getAccessToken());
    const baseUrl = this.fetchApiEndpoint();

    const options: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    if (body && (method === "POST" || method === "PUT")) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, options);

      if (!response.ok) {
        const errorText = await response.text();
        this.bot.logger.error(
          `PayPal API request failed: ${response.status}`,
          errorText,
        );
        throw new Error(
          `PayPal API error: ${response.status} ${response.statusText}`,
        );
      }

      // Handle 204 No Content responses
      if (response.status === HttpStatusCode.NO_CONTENT) {
        return null;
      }

      return await response.json();
    } catch (error) {
      this.bot.logger.error(`PayPal API request to ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * Create a new subscription for a user.
   *
   * This method checks if the user already has an active subscription, then creates a new subscription using the PayPal API and stores it in the database.
   * It returns the subscription ID and approval URL for the user to complete the subscription process.
   *
   * @param userId - The ID of the user subscribing
   * @param planKey - The key of the subscription plan (e.g., "premium_monthly")
   * @param userEmail - The email address of the user (for PayPal)
   * @param userName - The name of the user (for PayPal)
   * @param returnUrl - The URL to redirect the user after successful subscription approval
   * @param cancelUrl - The URL to redirect the user if they cancel the subscription process
   * @returns An object containing the PayPal subscription ID and approval URL
   */
  async createSubscription(
    userId: number,
    planKey: string,
    userEmail: string,
    userName: { given: string; surname: string },
    returnUrl: string,
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

    const accessToken = await this.getAccessToken();
    const baseUrl = this.fetchApiEndpoint();

    const subscriptionRequest: PayPalSubscriptionRequest = {
      plan_id: plan.planId,
      start_time: new Date(Date.now() + 60000).toISOString(), // Start in 1 minute
      subscriber: {
        name: {
          given_name: userName.given,
          surname: userName.surname,
        },
        email_address: userEmail,
      },
      application_context: {
        brand_name: "Mr. Whale Bot Premium",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        payment_method: {
          payer_selected: "PAYPAL",
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
        },
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    };

    try {
      const response = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "PayPal-Request-Id": `mrwhale-${userId}-${Date.now()}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify(subscriptionRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.bot.logger.error(
          `PayPal subscription creation failed: ${response.status}`,
          errorText,
        );
        throw new Error(`Failed to create subscription: ${response.status}`);
      }

      const subscriptionData: PayPalSubscriptionResponse =
        await response.json();

      // Store subscription in database
      await Subscription.create({
        userId,
        paypalSubscriptionId: subscriptionData.id,
        paypalPlanId: plan.planId,
        tier: plan.tier,
        status: "active", // Will be updated via webhook when actually approved
        startDate: new Date(subscriptionData.start_time),
        failedPayments: 0,
      });

      // Find approval URL
      const approvalLink = subscriptionData.links.find(
        (link) => link.rel === "approve",
      );
      if (!approvalLink) {
        throw new Error("No approval URL returned from PayPal");
      }

      this.bot.logger.info(
        `Created subscription ${subscriptionData.id} for user ${userId}`,
      );

      return {
        subscriptionId: subscriptionData.id,
        approvalUrl: approvalLink.href,
      };
    } catch (error) {
      this.bot.logger.error("Failed to create PayPal subscription:", error);
      throw error;
    }
  }

  /**
   * Cancel an active subscription for a user.
   *
   * This method cancels the user's active subscription using the PayPal API and updates the subscription status in the database.
   *
   * @param userId - The ID of the user whose subscription is to be cancelled
   * @param reason - Optional reason for cancellation to provide to PayPal
   */
  async cancelSubscription(
    userId: number,
    reason = "User requested cancellation",
  ): Promise<void> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription || subscription.status !== "active") {
      throw new Error("No active subscription found");
    }

    const accessToken = await this.getAccessToken();
    const baseUrl = this.fetchApiEndpoint();

    try {
      const response = await fetch(
        `${baseUrl}/v1/billing/subscriptions/${subscription.paypalSubscriptionId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            reason: reason,
          }),
        },
      );

      if (!response.ok && response.status !== HttpStatusCode.NO_CONTENT) {
        const errorText = await response.text();
        this.bot.logger.error(
          `PayPal subscription cancellation failed: ${response.status}`,
          errorText,
        );
        throw new Error(`Failed to cancel subscription: ${response.status}`);
      }

      // Update subscription in database
      await subscription.update({
        status: "cancelled",
        cancelledAt: new Date(),
      });

      this.bot.logger.info(
        `Cancelled subscription ${subscription.paypalSubscriptionId} for user ${userId}`,
      );
    } catch (error) {
      this.bot.logger.error("Failed to cancel PayPal subscription:", error);
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
   * Handle incoming PayPal webhook events to update subscription statuses accordingly.
   * This method processes various subscription-related events such as activation, cancellation, payment failures, and updates the subscription records in the database based on the event data.
   *
   * @param event - The PayPal webhook event object containing details about the subscription event that occurred
   */
  async handleWebhook(event: PayPalWebhookEvent): Promise<void> {
    try {
      this.bot.logger.info(
        `Processing PayPal webhook: ${event.event_type} for subscription ${event.resource.id}`,
      );

      const subscription = await Subscription.findOne({
        where: { paypalSubscriptionId: event.resource.id },
      });

      if (!subscription) {
        this.bot.logger.warn(
          `Webhook for unknown subscription: ${event.resource.id}`,
        );
        return;
      }

      switch (event.event_type) {
        case "BILLING.SUBSCRIPTION.ACTIVATED":
          await subscription.update({
            status: "active",
            startDate: new Date(event.resource.start_time),
            lastPaymentDate: new Date(),
            failedPayments: 0,
          });
          this.bot.logger.info(`Subscription ${event.resource.id} activated`);
          break;

        case "BILLING.SUBSCRIPTION.CANCELLED":
          await subscription.update({
            status: "cancelled",
            cancelledAt: new Date(),
          });
          this.bot.logger.info(`Subscription ${event.resource.id} cancelled`);
          break;

        case "BILLING.SUBSCRIPTION.SUSPENDED":
          await subscription.update({
            status: "suspended",
          });
          this.bot.logger.info(`Subscription ${event.resource.id} suspended`);
          break;

        case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
          await subscription.update({
            failedPayments: subscription.failedPayments + 1,
            status: "past_due",
          });
          this.bot.logger.warn(
            `Payment failed for subscription ${event.resource.id} (${
              subscription.failedPayments + 1
            } failures)`,
          );
          break;

        case "PAYMENT.SALE.COMPLETED":
          if (event.resource.billing_info?.last_payment) {
            await subscription.update({
              lastPaymentDate: new Date(
                event.resource.billing_info.last_payment.time,
              ),
              status: "active",
              failedPayments: 0,
            });

            if (event.resource.billing_info.next_billing_time) {
              await subscription.update({
                nextBillingDate: new Date(
                  event.resource.billing_info.next_billing_time,
                ),
              });
            }
          }
          this.bot.logger.info(
            `Payment completed for subscription ${event.resource.id}`,
          );
          break;

        case "BILLING.SUBSCRIPTION.EXPIRED":
          await subscription.update({
            status: "expired",
          });
          this.bot.logger.info(`Subscription ${event.resource.id} expired`);
          break;

        default:
          this.bot.logger.info(`Unhandled webhook event: ${event.event_type}`);
      }
    } catch (error) {
      this.bot.logger.error("Error processing PayPal webhook:", error);
      throw error;
    }
  }

  /**
   * Get the predefined subscription plans with their details.
   * This method returns the available subscription plans that users can choose from when subscribing to premium features. Each plan includes information such as the PayPal plan ID, name, tier, price, currency, and billing interval.
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
          monthly: premiumUsers * 4.99 + proUsers * 9.99,
          projected: (premiumUsers * 4.99 + proUsers * 9.99) * 12,
        },
      };
    } catch (error) {
      this.bot.logger.error("Error fetching subscription statistics:", error);
      throw error;
    }
  }

  /**
   * Verify the signature of incoming PayPal webhook events to ensure they are legitimate and have not been tampered with.
   * This method uses the PayPal API to verify the webhook signature based on the transmission ID, timestamp, certificate ID, webhook ID, and the raw body of the webhook event. It returns a boolean indicating whether the signature is valid.
   *
   * @param params - An object containing the necessary parameters for verifying the webhook signature, including the signature, transmission ID, timestamp, certificate ID, webhook ID, and raw body of the event.
   * @returns A boolean indicating whether the webhook signature is valid (true if valid, false if invalid).
   */
  async verifyWebhookSignature(params: {
    signature: string;
    transmissionId: string;
    timestamp: string;
    certId: string;
    webhookId: string;
    rawBody: string;
  }): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();

      const verificationResponse = await this.makePayPalRequest(
        "/v1/notifications/verify-webhook-signature",
        "POST",
        {
          transmission_id: params.transmissionId,
          cert_id: params.certId,
          auth_algo: "SHA256withRSA",
          transmission_sig: params.signature,
          transmission_time: params.timestamp,
          webhook_id: params.webhookId,
          webhook_event: JSON.parse(params.rawBody),
        },
        accessToken,
      );

      return verificationResponse.verification_status === "SUCCESS";
    } catch (error) {
      this.bot.logger.error("Error verifying webhook signature:", error);
      return false;
    }
  }
}
