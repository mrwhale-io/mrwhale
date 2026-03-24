/**
 * Represents a subscription plan available for purchase.
 */
export interface SubscriptionPlan {
  /**
   * Unique identifier for the subscription plan (e.g., "premium_monthly", "pro_yearly")
   */
  planId: string;
  /**
   * Display name for the subscription plan (e.g., "Premium Monthly", "Pro Yearly")
   */
  name: string;

  /**
   * Subscription tier ("premium" for individual users, "pro" for communities/creators)
   */
  tier: "premium" | "pro";

  /**
   * Price of the subscription plan (e.g., "4.99" for $4.99)
   */
  price: string;

  /**
   * Currency code for the price (e.g., "USD")
   */
  currency: string;

  /**
   * Billing interval for the subscription plan ("month" for monthly billing, "year" for yearly billing)
   */
  interval: "month" | "year";
}
