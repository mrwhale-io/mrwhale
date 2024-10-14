import { DataTypes, Model } from "sequelize";

import { database } from "..";

export interface ChestsOpenedAttributes {
  userId: string;
  guildId: string;
  quantity: number;
  totalChestsOpened?: number;
}

export interface ChestsOpenedInstance
  extends Model<ChestsOpenedAttributes, ChestsOpenedAttributes>,
    ChestsOpenedAttributes {}

export const ChestsOpened = database.connection.define<ChestsOpenedInstance>(
  "ChestsOpened",
  {
    userId: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    guildId: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    quantity: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  { tableName: "chests_opened", timestamps: false }
);
