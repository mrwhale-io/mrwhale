import { Model, DataTypes } from "sequelize";

import { FishTypeNames } from "@mrwhale-io/core";
import { database } from "..";

interface UserFishAttributes {
  userId: string;
  fishName: FishTypeNames;
  quantity: number;
}

export interface UserFishInstance
  extends Model<UserFishAttributes, UserFishAttributes>,
    UserFishAttributes {}

export const UserFish = database.connection.define<UserFishInstance>(
  "UserFish",
  {
    userId: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    fishName: {
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
  { tableName: "user_fish", timestamps: false }
);
