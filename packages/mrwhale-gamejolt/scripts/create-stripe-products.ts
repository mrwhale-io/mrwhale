import Stripe from "stripe";
import * as fs from "fs";
import * as path from "path";

interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  environment: 'test' | 'live';
}

interface Config {
  stripe: StripeConfig;
}

interface ProductInfo {
  name: string;
  description: string;
  prices: {
    monthly: {
      amount: number;
      currency: string;
    };
    yearly: {
      amount: number;
      currency: string;
    };
  };
}

class StripeProductCreator {
  private stripe: Stripe;
  private config: StripeConfig;

  constructor(config: StripeConfig) {
    this.config = config;
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: '2026-03-25.dahlia',
    });
  }

  async createProduct(productInfo: ProductInfo): Promise<{
    product: Stripe.Product;
    monthlyPrice: Stripe.Price;
    yearlyPrice: Stripe.Price;
  }> {
    try {
      // Create the product
      console.log(`Creating product: ${productInfo.name}...`);
      const product = await this.stripe.products.create({
        name: productInfo.name,
        description: productInfo.description,
        type: 'service',
        metadata: {
          source: 'mrwhale-bot',
          tier: productInfo.name.toLowerCase().includes('premium') ? 'premium' : 'pro',
        },
      });

      console.log(`✅ Created product: ${product.id}`);

      // Create monthly price
      console.log(`Creating monthly price for ${productInfo.name}...`);
      const monthlyPrice = await this.stripe.prices.create({
        product: product.id,
        currency: productInfo.prices.monthly.currency,
        unit_amount: productInfo.prices.monthly.amount,
        recurring: {
          interval: 'month',
        },
        nickname: `${productInfo.name} Monthly`,
        metadata: {
          tier: productInfo.name.toLowerCase().includes('premium') ? 'premium' : 'pro',
          interval: 'month',
        },
      });

      console.log(`✅ Created monthly price: ${monthlyPrice.id}`);

      // Create yearly price (with discount)
      console.log(`Creating yearly price for ${productInfo.name}...`);
      const yearlyPrice = await this.stripe.prices.create({
        product: product.id,
        currency: productInfo.prices.yearly.currency,
        unit_amount: productInfo.prices.yearly.amount,
        recurring: {
          interval: 'year',
        },
        nickname: `${productInfo.name} Yearly`,
        metadata: {
          tier: productInfo.name.toLowerCase().includes('premium') ? 'premium' : 'pro',
          interval: 'year',
        },
      });

      console.log(`✅ Created yearly price: ${yearlyPrice.id}`);

      return { product, monthlyPrice, yearlyPrice };
    } catch (error) {
      console.error(`❌ Failed to create product ${productInfo.name}:`, error);
      throw error;
    }
  }

  async createAllProducts(): Promise<void> {
    console.log("🚀 Creating Stripe products and prices for Mr. Whale Bot subscriptions...\n");
    console.log(`Environment: ${this.config.environment.toUpperCase()}\n`);

    const products: Record<string, ProductInfo> = {
      premium: {
        name: "Mr. Whale Premium",
        description: "Premium subscription for Mr. Whale Bot - Unlimited image effects and advanced features",
        prices: {
          monthly: {
            amount: 299, // $2.99 in cents
            currency: 'usd',
          },
          yearly: {
            amount: 2999, // $29.99 in cents (17% discount)
            currency: 'usd',
          },
        },
      },
      pro: {
        name: "Mr. Whale Pro",
        description: "Pro subscription for Mr. Whale Bot - AI-powered effects, animations, and premium support",
        prices: {
          monthly: {
            amount: 799, // $7.99 in cents
            currency: 'usd',
          },
          yearly: {
            amount: 7999, // $79.99 in cents (17% discount)
            currency: 'usd',
          },
        },
      },
    };

    const results: Record<string, any> = {};

    for (const [key, productInfo] of Object.entries(products)) {
      try {
        const result = await this.createProduct(productInfo);
        results[key] = {
          product: result.product,
          monthlyPrice: result.monthlyPrice,
          yearlyPrice: result.yearlyPrice,
        };
        console.log(`✨ Successfully created ${productInfo.name} with pricing!\n`);
      } catch (error) {
        console.error(`❌ Failed to create ${productInfo.name}:`, error);
        process.exit(1);
      }
    }

    // Display summary
    console.log("📋 SETUP COMPLETE - Update your subscription manager with these price IDs:");
    console.log("=".repeat(80));
    
    console.log("\nUpdate your SubscriptionManager plans with these Price IDs:");
    console.log(`
premium_monthly: {
  planId: "${results.premium.monthlyPrice.id}",
  name: "Premium Monthly",
  tier: "premium",
  price: "2.99",
  currency: "USD",
  interval: "month",
},
premium_yearly: {
  planId: "${results.premium.yearlyPrice.id}",
  name: "Premium Yearly", 
  tier: "premium",
  price: "29.99",
  currency: "USD",
  interval: "year",
},
pro_monthly: {
  planId: "${results.pro.monthlyPrice.id}",
  name: "Pro Monthly",
  tier: "pro", 
  price: "7.99",
  currency: "USD",
  interval: "month",
},
pro_yearly: {
  planId: "${results.pro.yearlyPrice.id}",
  name: "Pro Yearly",
  tier: "pro",
  price: "79.99", 
  currency: "USD",
  interval: "year",
},`);

    console.log("\n🎯 Next steps:");
    console.log("1. Copy the price IDs above into your SubscriptionManager");
    console.log("2. Set up webhook endpoints to handle subscription events");
    console.log("3. Test the subscription flow in your environment");
    console.log("4. When ready for production, create new products with live keys");
    
    console.log("\n💡 Tips:");
    console.log("- Test Mode: Use test credit card 4242 4242 4242 4242");
    console.log("- Monitor: Check Stripe Dashboard for subscription activity");
    console.log("- Webhooks: Configure webhook for customer.subscription.* events");
  }
}

async function main(): Promise<void> {
  try {
    // Load configuration
    const configPath = path.resolve(__dirname, "..", "config.json");
    
    if (!fs.existsSync(configPath)) {
      console.error(`❌ Configuration file not found: ${configPath}`);
      console.log("📝 Please create config.json with your Stripe configuration:");
      console.log(`{
  "stripe": {
    "secretKey": "sk_test_your-stripe-secret-key",
    "webhookSecret": "whsec_your-webhook-secret", 
    "environment": "test"
  }
}`);
      process.exit(1);
    }

    const config: Config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

    if (!config.stripe) {
      console.error("❌ Stripe configuration not found in config.json");
      console.log("📝 Please add Stripe configuration to your config.json file");
      process.exit(1);
    }

    if (!config.stripe.secretKey || !config.stripe.webhookSecret) {
      console.error("❌ Stripe secretKey and webhookSecret are required");
      console.log("📝 Please ensure both secretKey and webhookSecret are configured");
      process.exit(1);
    }

    const creator = new StripeProductCreator(config.stripe);
    await creator.createAllProducts();

    console.log("\n🎉 All products and prices created successfully!");
    console.log("You can now start accepting Stripe subscriptions!");

  } catch (error) {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}