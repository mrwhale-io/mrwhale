import { Model, DataTypes } from "sequelize";

import { FishTypeNames } from "@mrwhale-io/core";
import { database } from "..";

interface FishAttributes {
  id: number;
  name: FishTypeNames;
  icon: string;
  worth: number;
  expWorth: number;
  hpWorth: number;
  probability: number;
}

export interface FishInstance
  extends Model<FishAttributes, FishAttributes>,
    FishAttributes {}

export const Fish = database.connection.define<FishInstance>(
  "Fish",
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
    icon: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    worth: {
      allowNull: false,
      type: DataTypes.NUMBER,
    },
    expWorth: {
      allowNull: false,
      type: DataTypes.NUMBER,
    },
    hpWorth: {
      allowNull: false,
      type: DataTypes.NUMBER,
    },
    probability: {
      allowNull: false,
      type: DataTypes.NUMBER,
    },
  },
  { tableName: "fish", timestamps: false }
);
