import { Model, DataTypes } from "sequelize";
import { database } from "..";

interface UsageAttributes {
  userId: number;
  date: string; // YYYY-MM-DD format
  imageEffectsCount: number;
  customCommandsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageInstance
  extends Model<UsageAttributes, Partial<UsageAttributes>>,
    UsageAttributes {}

export const Usage = database.connection.define<UsageInstance>(
  "Usage",
  {
    userId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      comment: "Game Jolt user ID",
    },
    date: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.DATEONLY,
      comment: "Date in YYYY-MM-DD format",
    },
    imageEffectsCount: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Number of image effects used today",
    },
    customCommandsCount: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Number of custom commands created today",
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
    tableName: "usage_tracking",
    timestamps: true,
    indexes: [
      {
        fields: ["date"],
      },
    ],
  }
);