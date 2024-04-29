import { Model, DataTypes } from "sequelize";

import { ItemTypes } from "@mrwhale-io/core";
import { database } from "..";

interface InventoryAttributes {
  userId: string;
  itemName: string;
  itemType: ItemTypes;
  quantity: number;
}

export interface InventoryInstance
  extends Model<InventoryAttributes, InventoryAttributes>,
    InventoryAttributes {}

export const Inventory = database.connection.define<InventoryInstance>(
  "Inventory",
  {
    userId: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    itemName: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    itemType: {
      allowNull: false,
      type: DataTypes.STRING,
      defaultValue: 0,
    },
    quantity: {
      allowNull: false,
      type: DataTypes.NUMBER,
      defaultValue: 0,
    },
  },
  { tableName: "inventory", timestamps: false }
);
