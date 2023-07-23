import { Model, DataTypes } from "sequelize";
import { database } from "..";

interface AuthAttributes {
  id?: number;
  publicKey: string;
  privateKey: string;
}

export interface AuthInstance
  extends Model<AuthAttributes, AuthAttributes>,
    AuthAttributes {}

export const Auth = database.connection.define<AuthInstance>(
  "Auth",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    publicKey: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    privateKey: {
      allowNull: false,
      type: DataTypes.STRING,
    },
  },
  { tableName: "auth", timestamps: false }
);
