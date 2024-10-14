import { Model, DataTypes } from "sequelize";
import { database } from "..";

interface UserBalanceAttributes {
  userId: string;
  guildId: string;
  balance: number;
  totalBalance?: number;
}

export interface UserBalanceInstance
  extends Model<UserBalanceAttributes, UserBalanceAttributes>,
    UserBalanceAttributes {}

export const UserBalance = database.connection.define<UserBalanceInstance>(
  "UserBalance",
  {
    userId: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    guildId: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    balance: {
      allowNull: false,
      type: DataTypes.NUMBER,
      defaultValue: 0,
    },
  },
  { tableName: "user_balances", timestamps: false }
);
