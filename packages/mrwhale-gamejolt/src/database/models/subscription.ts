import { Model, DataTypes } from "sequelize";
import { database } from "..";

interface SubscriptionAttributes {
  userId: number;
  stripeSubscriptionId: string;
  stripePriceId: string;
  tier: "free" | "premium" | "pro";
  status:
    | "active"
    | "pending"
    | "cancelled"
    | "cancelling"
    | "past_due"
    | "suspended"
    | "expired";
  startDate: Date;
  nextBillingDate?: Date;
  lastPaymentDate?: Date;
  cancelledAt?: Date;
  failedPayments: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionInstance
  extends Model<SubscriptionAttributes, Partial<SubscriptionAttributes>>,
    SubscriptionAttributes {}

export const Subscription = database.connection.define<SubscriptionInstance>(
  "Subscription",
  {
    userId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      comment: "Game Jolt user ID",
    },
    stripeSubscriptionId: {
      allowNull: false,
      type: DataTypes.STRING(50),
      unique: true,
      comment: "Stripe subscription ID",
    },
    stripePriceId: {
      allowNull: false,
      type: DataTypes.STRING(50),
      comment: "Stripe price ID for the subscription tier",
    },
    tier: {
      allowNull: false,
      type: DataTypes.ENUM("free", "premium", "pro"),
      defaultValue: "free",
      comment: "Subscription tier level",
    },
    status: {
      allowNull: false,
      type: DataTypes.ENUM(
        "active",
        "pending", 
        "cancelled",
        "cancelling",
        "past_due",
        "suspended",
        "expired",
      ),
      defaultValue: "pending",
      comment: "Current subscription status",
    },
    startDate: {
      allowNull: false,
      type: DataTypes.DATE,
      comment: "When the subscription started",
    },
    nextBillingDate: {
      allowNull: true,
      type: DataTypes.DATE,
      comment: "Next billing date",
    },
    lastPaymentDate: {
      allowNull: true,
      type: DataTypes.DATE,
      comment: "Last successful payment date",
    },
    cancelledAt: {
      allowNull: true,
      type: DataTypes.DATE,
      comment: "When the subscription was cancelled",
    },
    failedPayments: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Number of consecutive failed payments",
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "subscriptions",
    timestamps: true,
    indexes: [
      {
        fields: ["stripeSubscriptionId"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["tier"],
      },
    ],
  },
);
