import { Model, DataTypes } from "sequelize";

import { database } from "..";

interface FishFedAttributes {
  userId: string;
  guildId: string;
  fishId: number;
  quantity: number;
  totalQuantity?: number;
}

export interface FishFedInstance
  extends Model<FishFedAttributes, FishFedAttributes>,
    FishFedAttributes {}

export const FishFed = database.connection.define<FishFedInstance>(
  "FishFed",
  {
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    guildId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fishId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  { tableName: "fish_fed", timestamps: false }
);
