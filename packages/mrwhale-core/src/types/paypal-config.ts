/**
 * PayPal configuration for subscription management
 */
export interface PayPalConfig {
  /**
   * PayPal client ID for API access
   */
  clientId: string;

  /**
   * PayPal client secret for API access
   */
  clientSecret: string;

  /**
   * PayPal environment ("sandbox" for development, "production" for live)
   */
  environment: "sandbox" | "production";

  /**
   * PayPal webhook ID for webhook validation
   */
  webhookId: string;
}
