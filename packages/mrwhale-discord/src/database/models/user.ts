import { Model, DataTypes } from "sequelize";
import { database } from "..";

interface UserAttributes {
  id: string;
  balance: number;
}

export interface UserInstance
  extends Model<UserAttributes, UserAttributes>,
    UserAttributes {}

export const User = database.connection.define<UserInstance>(
  "User",
  {
    id: {
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
  { tableName: "users", timestamps: false }
);
