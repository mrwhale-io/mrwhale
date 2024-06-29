import { Model, DataTypes } from "sequelize";

import { database } from "..";

interface BaitAttributes {
  id: number;
  name: string;
  description: string;
  icon: string;
  cost: number;
  effectiveness: number;
  minLevel: number;
}

export interface BaitInstance
  extends Model<BaitAttributes, BaitAttributes>,
    BaitAttributes {}

export const Bait = database.connection.define<BaitInstance>(
  "Bait",
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
    icon: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    cost: {
      allowNull: false,
      type: DataTypes.NUMBER,
    },
    effectiveness: {
      allowNull: false,
      type: DataTypes.NUMBER,
    },
    minLevel: {
      allowNull: false,
      type: DataTypes.NUMBER,
    },
  },
  { tableName: "baits", timestamps: false }
);
