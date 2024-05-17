import { Model, DataTypes } from "sequelize";

import { FishingRodNames } from "@mrwhale-io/core";
import { database } from "..";

interface FishingRodAttributes {
  id: number;
  name: FishingRodNames;
  description: string;
  cost: number;
  probabilityMultiplier: number;
}

export interface FishingRodInstance
  extends Model<FishingRodAttributes, FishingRodAttributes>,
    FishingRodAttributes {}

export const FishingRod = database.connection.define<FishingRodInstance>(
  "FishingRod",
  {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true,
    },
    description: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    cost: {
      allowNull: false,
      type: DataTypes.NUMBER,
    },
    probabilityMultiplier: {
      allowNull: false,
      type: DataTypes.NUMBER,
    },
  },
  { tableName: "fishing_rods", timestamps: false }
);
