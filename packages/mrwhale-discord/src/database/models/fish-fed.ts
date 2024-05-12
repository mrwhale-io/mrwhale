import { Model, DataTypes } from "sequelize";

import { database } from "..";

interface FishFedAttributes {
  userId: string;
  guildId: string;
  quantity: number;
}

export interface FishFedInstance
  extends Model<FishFedAttributes, FishFedAttributes>,
    FishFedAttributes {}

export const FishFed = database.connection.define<FishFedInstance>(
  "FishFed",
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
  { tableName: "fish_fed", timestamps: false }
);
