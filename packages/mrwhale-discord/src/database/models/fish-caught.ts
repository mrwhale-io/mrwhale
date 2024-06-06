import { Model, DataTypes } from "sequelize";

import { FishRarity } from "@mrwhale-io/core";
import { database } from "..";

interface FishCaughtAttributes {
  userId: string;
  guildId: string;
  fishId: number;
  quantity: number;
  rarity: FishRarity;
}

export interface FishCaughtInstance
  extends Model<FishCaughtAttributes, FishCaughtAttributes>,
    FishCaughtAttributes {}

export const FishCaught = database.connection.define<FishCaughtInstance>(
  "FishCaught",
  {
    userId: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    guildId: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    fishId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    quantity: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    rarity: {
      allowNull: false,
      type: DataTypes.ENUM("Common", "Uncommon", "Rare", "Epic", "Legendary"),
    },
  },
  { tableName: "fish_caught", timestamps: false }
);
