import axios from "axios";
import * as fs from "fs";
import * as path from "path";

interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  environment: "sandbox" | "production";
}

interface Config {
  paypal: PayPalConfig;
}

interface PayPalProduct {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
}

interface PayPalPlan {
  id: string;
  product_id: string;
  name: string;
  description: string;
  status: string;
}

class PayPalPlanCreator {
  private config: PayPalConfig;
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(config: PayPalConfig) {
    this.config = config;
    this.baseUrl =
      config.environment === "sandbox"
        ? "https://api-m.sandbox.paypal.com"
        : "https://api-m.paypal.com";
  }

  async getAccessToken(): Promise<string | null> {
    if (this.accessToken) return this.accessToken;

    const auth = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`,
    ).toString("base64");

    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/oauth2/token`,
        "grant_type=client_credentials",
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error: any) {
      throw new Error(
        `Failed to get PayPal access token: ${
          error.response?.data?.error_description || error.message
        }`,
      );
    }
  }

  async createProduct(
    productData: Partial<PayPalProduct>,
  ): Promise<PayPalProduct> {
    const token = await this.getAccessToken();

    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/catalogs/products`,
        productData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (error: any) {
      if (
        error.response?.status === 422 &&
        error.response?.data?.name === "DUPLICATE_RESOURCE_IDENTIFIER"
      ) {
        // Product already exists, fetch it
        console.log(
          `Product ${productData.id} already exists, fetching existing product...`,
        );
        return await this.getProduct(productData.id!);
      }
      throw new Error(
        `Failed to create product: ${
          error.response?.data?.message || error.message
        }`,
      );
    }
  }

  async getProduct(productId: string): Promise<PayPalProduct> {
    const token = await this.getAccessToken();

    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/catalogs/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to get product: ${
          error.response?.data?.message || error.message
        }`,
      );
    }
  }

  async createPlan(planData: any): Promise<PayPalPlan> {
    const token = await this.getAccessToken();

    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/billing/plans`,
        planData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to create plan: ${
          error.response?.data?.message || error.message
        }`,
      );
    }
  }

  async createSubscriptionPlans(): Promise<void> {
    console.log(
      `🚀 Creating PayPal subscription plans in ${this.config.environment} environment...`,
    );

    // Create products first
    const premiumProduct = await this.createProduct({
      id: "PROD-MRWHALE-PREMIUM",
      name: "Mr Whale Premium",
      description: "Premium features for Mr Whale GameJolt bot",
      type: "SERVICE",
      category: "SOFTWARE",
    });
    console.log(`✅ Premium product created: ${premiumProduct.id}`);

    const proProduct = await this.createProduct({
      id: "PROD-MRWHALE-PRO",
      name: "Mr Whale Pro",
      description: "Pro features with AI for Mr Whale GameJolt bot",
      type: "SERVICE",
      category: "SOFTWARE",
    });
    console.log(`✅ Pro product created: ${proProduct.id}`);

    // Create Premium Plan
    const premiumPlan = await this.createPlan({
      product_id: premiumProduct.id,
      name: "Mr Whale Premium",
      description:
        "Premium features: 25 custom commands/day, unlimited visual effects",
      billing_cycles: [
        {
          frequency: {
            interval_unit: "MONTH",
            interval_count: 1,
          },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: this.config.environment === "sandbox" ? "0.01" : "4.99",
              currency_code: "USD",
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3,
      },
      taxes: {
        percentage: "0",
        inclusive: false,
      },
    });
    console.log(`✅ Premium plan created: ${premiumPlan.id}`);

    // Create Pro Plan
    const proPlan = await this.createPlan({
      product_id: proProduct.id,
      name: "Mr Whale Pro",
      description:
        "Pro features: 100 custom commands/day, unlimited effects, AI features",
      billing_cycles: [
        {
          frequency: {
            interval_unit: "MONTH",
            interval_count: 1,
          },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: this.config.environment === "sandbox" ? "0.02" : "9.99",
              currency_code: "USD",
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3,
      },
      taxes: {
        percentage: "0",
        inclusive: false,
      },
    });
    console.log(`✅ Pro plan created: ${proPlan.id}`);

    // Output the plan IDs for configuration
    console.log("\n📋 Plan Configuration:");
    console.log("Add these plan IDs to your subscription-manager.ts:");
    console.log(`Premium Plan ID: ${premiumPlan.id}`);
    console.log(`Pro Plan ID: ${proPlan.id}`);

    console.log("\n💰 Plan Prices:");
    if (this.config.environment === "sandbox") {
      console.log("Sandbox pricing for testing:");
      console.log("  Premium: $0.01/month");
      console.log("  Pro: $0.02/month");
    } else {
      console.log("Production pricing:");
      console.log("  Premium: $4.99/month");
      console.log("  Pro: $9.99/month");
    }
  }
}

async function main(): Promise<void> {
  try {
    // Load config
    const configPath = path.join(__dirname, "..", "config.json");
    if (!fs.existsSync(configPath)) {
      throw new Error(
        "config.json not found. Please create it with your PayPal credentials.",
      );
    }

    const config: Config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    if (!config.paypal) {
      throw new Error("PayPal configuration not found in config.json");
    }

    if (!config.paypal.clientId || !config.paypal.clientSecret) {
      throw new Error(
        "PayPal clientId and clientSecret are required in config.json",
      );
    }

    const creator = new PayPalPlanCreator(config.paypal);
    await creator.createSubscriptionPlans();

    console.log("\n🎉 Subscription plans created successfully!");
    console.log("\nNext steps:");
    console.log("1. Copy the Plan IDs above into your subscription-manager.ts");
    console.log("2. Test the subscription flow with the bot commands");
    console.log("3. Set up webhooks for payment notifications");
  } catch (error: any) {
    console.error("❌ Error creating subscription plans:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { PayPalPlanCreator };
