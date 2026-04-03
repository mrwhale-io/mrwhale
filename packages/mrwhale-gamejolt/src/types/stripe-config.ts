/**
 * Stripe configuration for subscription management.
 */
export interface StripeConfig {
  /** Stripe secret key (starts with sk_) */
  secretKey: string;
  /** Stripe webhook endpoint secret (starts with whsec_) */
  webhookSecret: string;
  /** Environment: 'test' for development, 'live' for production */
  environment: string;
}
