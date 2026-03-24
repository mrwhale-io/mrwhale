/**
 * PayPal OAuth access token response for API authentication
 */
export interface PayPalAccessToken {
  /** Bearer token for authenticating PayPal API requests */
  access_token: string;
  /** Token type, typically "Bearer" */
  token_type: string;
  /** Token expiration time in seconds */
  expires_in: number;
}

/**
 * Request payload for creating a PayPal subscription
 */
export interface PayPalSubscriptionRequest {
  /** PayPal plan ID that defines the subscription billing cycle and pricing */
  plan_id: string;
  /** Optional subscription start time in ISO 8601 format. Defaults to immediate start */
  start_time?: string;
  /** Subscriber information including name and email */
  subscriber: {
    /** Subscriber's full name */
    name: {
      /** First name of the subscriber */
      given_name: string;
      /** Last name of the subscriber */
      surname: string;
    };
    /** Email address for PayPal communications and receipts */
    email_address: string;
  };
  /** Application context for customizing the PayPal checkout experience */
  application_context: {
    /** Brand name displayed during PayPal checkout */
    brand_name: string;
    /** Locale for the PayPal checkout page (e.g., "en_US") */
    locale: string;
    /** Shipping preference - set to NO_SHIPPING for digital subscriptions */
    shipping_preference: "NO_SHIPPING";
    /** User action - SUBSCRIBE_NOW shows subscribe button instead of continue */
    user_action: "SUBSCRIBE_NOW";
    /** Payment method preferences */
    payment_method: {
      /** Preferred payment method selected by payer */
      payer_selected: "PAYPAL";
      /** Payee preference for immediate payment */
      payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED";
    };
    /** URL to redirect user after successful subscription approval */
    return_url: string;
    /** URL to redirect user if they cancel the subscription process */
    cancel_url: string;
  };
}

/**
 * PayPal subscription creation response containing subscription details and approval links
 */
export interface PayPalSubscriptionResponse {
  /** Unique PayPal subscription identifier */
  id: string;
  /** Current subscription status (e.g., "APPROVAL_PENDING", "ACTIVE") */
  status: string;
  /** Timestamp of last status update */
  status_update_time: string;
  /** Associated plan ID used for this subscription */
  plan_id: string;
  /** Subscription start time */
  start_time: string;
  /** Subscription creation timestamp */
  create_time: string;
  /** HATEOAS links for subscription management */
  links: Array<{
    /** URL for the linked action */
    href: string;
    /** Relationship type (e.g., "approve", "self", "edit") */
    rel: string;
    /** HTTP method for the link */
    method: string;
  }>;
}

/**
 * PayPal webhook event payload received when subscription events occur
 * Used for handling real-time subscription status changes, payments, and cancellations
 */
export interface PayPalWebhookEvent {
  /** Unique webhook event identifier */
  id: string;
  /** Type of event (e.g., "BILLING.SUBSCRIPTION.CREATED", "PAYMENT.SALE.COMPLETED") */
  event_type: string;
  /** Event creation timestamp */
  create_time: string;
  /** Type of resource that triggered the event */
  resource_type: string;
  /** Version of the resource */
  resource_version: string;
  /** Version of the event format */
  event_version: string;
  /** Human-readable summary of the event */
  summary: string;
  /** The actual resource data that changed */
  resource: {
    /** Subscription ID */
    id: string;
    /** Current subscription status */
    status: string;
    /** Optional note explaining status change */
    status_change_note?: string;
    /** Associated plan ID */
    plan_id: string;
    /** Subscription start time */
    start_time: string;
    /** Subscription creation time */
    create_time: string;
    /** Last update time */
    update_time: string;
    /** Billing information including payment history and next billing date */
    billing_info?: {
      /** Any outstanding balance on the subscription */
      outstanding_balance: {
        /** Currency code (e.g., "USD") */
        currency_code: string;
        /** Balance amount as string */
        value: string;
      };
      /** Array of billing cycle executions */
      cycle_executions: Array<any>;
      /** Details of the most recent payment */
      last_payment?: {
        /** Payment amount */
        amount: {
          /** Currency code */
          currency_code: string;
          /** Payment amount as string */
          value: string;
        };
        /** Payment timestamp */
        time: string;
      };
      /** Next scheduled billing date */
      next_billing_time?: string;
      /** Final payment date for terminated subscriptions */
      final_payment_time?: string;
      /** Count of failed payment attempts */
      failed_payments_count: number;
    };
    /** Subscriber details */
    subscriber: {
      /** Subscriber name */
      name: {
        /** First name */
        given_name: string;
        /** Last name */
        surname: string;
      };
      /** Email address */
      email_address: string;
      /** PayPal payer ID */
      payer_id: string;
    };
  };
}
