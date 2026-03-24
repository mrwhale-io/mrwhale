# PayPal Subscriptions Setup Guide

This guide explains how to set up PayPal Subscriptions for premium features in the Mr. Whale Game Jolt bot.

## Overview

The subscription system provides three tiers:
- **FREE**: 5 custom commands, 10 visual effects per day
- **PREMIUM**: 25 custom commands, unlimited visual effects ($4.99/month)
- **PRO**: 100 custom commands, unlimited effects + AI features ($9.99/month)

## Prerequisites

1. PayPal Developer Account
2. Express.js server for webhook handling
3. SQLite database with Sequelize ORM

## Step 1: PayPal Developer Setup

### 1.1 Create PayPal Application

1. Go to [PayPal Developer Console](https://developer.paypal.com/)
2. Log in with your PayPal account
3. Navigate to "My Apps & Credentials"
4. Click "Create App"
5. Fill in the details:
   - App Name: "Mr Whale Subscriptions"
   - Merchant: Select your business account
   - Features: Check "Subscriptions"
6. Copy the **Client ID** and **Client Secret**

### 1.2 Create Subscription Plans

#### Automated Setup (Recommended)

Use the provided script to automatically create subscription plans:

```bash
cd packages/mrwhale-gamejolt
npm run create-paypal-plans
```

This script will:
- Create products for Premium and Pro tiers
- Create subscription plans with appropriate pricing
- Use test amounts in sandbox ($0.01/$0.02) for easy testing  
- Use production amounts ($4.99/$9.99) in production environment
- Output the Plan IDs to copy into your configuration

#### Manual Setup (Alternative)

If you prefer to create plans manually using PayPal API directly:

##### Create Premium Plan
```bash
curl -X POST https://api-m.sandbox.paypal.com/v1/billing/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "product_id": "PROD-MRWHALE-PREMIUM",
    "name": "Mr Whale Premium",
    "description": "Premium features: 25 custom commands/day, unlimited visual effects",
    "billing_cycles": [{
      "frequency": {
        "interval_unit": "MONTH",
        "interval_count": 1
      },
      "tenure_type": "REGULAR",
      "sequence": 1,
      "total_cycles": 0,
      "pricing_scheme": {
        "fixed_price": {
          "value": "0.01",
          "currency_code": "USD"
        }
      }
    }],
    "payment_preferences": {
      "auto_bill_outstanding": true,
      "setup_fee_failure_action": "CONTINUE",
      "payment_failure_threshold": 3
    }
  }'
```

##### Create Pro Plan
```bash
curl -X POST https://api-m.sandbox.paypal.com/v1/billing/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "product_id": "PROD-MRWHALE-PRO",
    "name": "Mr Whale Pro", 
    "description": "Pro features: 100 custom commands/day, unlimited effects, AI features",
    "billing_cycles": [{
      "frequency": {
        "interval_unit": "MONTH",
        "interval_count": 1
      },
      "tenure_type": "REGULAR",
      "sequence": 1,
      "total_cycles": 0,
      "pricing_scheme": {
        "fixed_price": {
          "value": "0.02",
          "currency_code": "USD"
        }
      }
    }],
    "payment_preferences": {
      "auto_bill_outstanding": true,
      "setup_fee_failure_action": "CONTINUE",
      "payment_failure_threshold": 3
    }
  }'
```

**Note:** The manual examples show sandbox pricing ($0.01/$0.02). For production, change to $4.99/$9.99.

### 1.3 Create Webhook

1. In PayPal Developer Console, go to "Webhooks"
2. Click "Create Webhook"
3. Set the URL to: `https://yourdomain.com/webhook/paypal`
4. Select these events:
   - `BILLING.SUBSCRIPTION.CREATED`
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `PAYMENT.SALE.COMPLETED`
5. Copy the **Webhook ID**

## Step 2: Configuration

### 2.1 Update config.json

```json
{
  "frontend": "your-frontend-url",
  "userId": 1,
  "prefix": "!",
  "ownerId": 1,
  "database": "database.sqlite",
  "baseApiUrl": "https://gamejolt.com/site-api",
  "baseChatUrl": "https://chatex.gamejolt.com/chatex",
  "baseGridUrl": "your-grid-url",
  "youtube": "your-youtube-key",
  "openWeather": "your-weather-key",
  "privateKey": "your-gamejolt-private-key",
  "gameId": 1,
  "mrwhaleToken": "your-mrwhale-token",
  "adminToken": "your-admin-dashboard-token",
  "paypal": {
    "clientId": "your-paypal-client-id",
    "clientSecret": "your-paypal-client-secret",
    "environment": "sandbox",
    "webhookId": "your-webhook-id"
  }
}
```

### 2.2 Update Subscription Plans

Edit `src/client/managers/subscription-manager.ts` to include your PayPal plan IDs:

```typescript
private subscriptionPlans: Record<string, SubscriptionPlan> = {
  premium: {
    name: 'Premium',
    price: '$4.99/month',
    paypalPlanId: 'P-YOUR-PREMIUM-PLAN-ID', // Replace with actual plan ID
    features: [
      '25 custom commands per day',
      'Unlimited visual effects',
      'Premium costume transformations',
      'Advanced image effects'
    ],
    limits: {
      commandsPerDay: 25,
      effectsPerDay: -1
    }
  },
  pro: {
    name: 'Pro',
    price: '$9.99/month',
    paypalPlanId: 'P-YOUR-PRO-PLAN-ID', // Replace with actual plan ID
    features: [
      '100 custom commands per day',
      'Unlimited visual effects',
      'All costume transformations',
      'AI-powered features',
      'Priority support'
    ],
    limits: {
      commandsPerDay: 100,
      effectsPerDay: -1
    }
  }
};
```

## Step 3: Database Setup

The database models are automatically created when you start the bot. Ensure your SQLite database is accessible at the path specified in `config.json`.

## Step 4: Starting the Services

### 4.1 Development Mode

Start the bot:
```bash
npm run dev:bot
```

Start the webhook server:
```bash
npm run dev:server
```

### 4.2 Production Mode

Build and start:
```bash
npm run start        # Starts bot only
npm run start:server # Starts webhook server
```

## Step 5: Testing

### 5.0 Create Test Plans

Before testing the subscription flow, create your PayPal plans:

```bash
npm run create-paypal-plans
```

This will create test plans with $0.01 and $0.02 pricing in sandbox mode.

### 5.1 Test Subscription Flow

1. Use `!subscribe` command in GameJolt chat
2. Select a plan (Premium or Pro)
3. Complete PayPal checkout in sandbox
4. Verify webhook is received
5. Check subscription status with `!mystatus`

### 5.2 Test Premium Features

Try premium commands:
```
!hologram @user     # Premium visual effect
!wizard @user       # Fantasy costume transformation  
!customcmd create "test" "This is a test command"
```

### 5.3 Test Cancellation

```
!cancel             # Initiate cancellation
!confirm cancel     # Confirm cancellation
!mystatus          # Verify cancellation status
```

## Step 6: Production Deployment

### 6.1 PayPal Environment

Change `config.json`:
```json
{
  "paypal": {
    "environment": "production"
  }
}
```

### 6.2 Webhook Security

The system automatically validates PayPal webhook signatures for security. Ensure your webhook endpoint is HTTPS in production.

### 6.3 Monitoring

Check subscription statistics:
```
GET https://yourdomain.com/admin/subscriptions
Authorization: Bearer your-admin-token
```

## Available Commands

### User Commands
- `!subscribe` - View and purchase subscription plans
- `!mystatus` - Check current subscription status
- `!usage` - View usage statistics and limits
- `!billing` - View billing history and payment info
- `!cancel` - Cancel subscription
- `!confirm-cancel` - Confirm cancellation

### Premium Commands
- Custom command builder
- Advanced visual effects (hologram, glitch, neon)
- Fantasy costumes (wizard, pirate, ninja, vampire, dragon, superhero)
- And more premium features as they're added

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check webhook URL is accessible
   - Verify webhook events are selected
   - Check server logs for errors

2. **PayPal API errors**
   - Verify client credentials
   - Check environment (sandbox vs production)
   - Ensure subscription plans exist

3. **Database errors**
   - Check SQLite file permissions
   - Verify database path in config
   - Check Sequelize connection

### Logs

Check application logs in:
- `logs/error.log`
- `logs/combined.log`
- Console output for webhook server

### Support

For technical issues:
1. Check the logs first
2. Verify PayPal configuration
3. Test webhook endpoint manually
4. Open an issue on GitHub with error details

## Security Considerations

1. **Never commit config.json** with real credentials
2. Use strong admin tokens
3. Validate all webhook signatures
4. Use HTTPS in production
5. Regular security updates for dependencies
6. Monitor for suspicious activity

## License

MIT License - see LICENSE file for details.