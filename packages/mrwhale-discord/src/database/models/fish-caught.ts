import { Model, DataTypes } from "sequelize";

import { database } from "..";

interface FishCaughtAttributes {
  userId: string;
  guildId: string;
  quantity: number;
}

export interface FishCaughtInstance
  extends Model<FishCaughtAttributes, FishCaughtAttributes>,
    FishCaughtAttributes {}

export const FishCaught = database.connection.define<FishCaughtInstance>(
  "FishCaught",
  {
    userId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    guildId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    quantity: {
      allowNull: false,
      type: DataTypes.NUMBER,
      defaultValue: 0,
    },
  },
  { tableName: "fish_caught", timestamps: false }
);
