import { Model, DataTypes } from "sequelize";

import { ItemTypes } from "@mrwhale-io/core";
import { database } from "..";
import { Fish, FishInstance } from "./fish";
import { FishingRod, FishingRodInstance } from "./fishing-rod";
import { Bait, BaitInstance } from "./bait";

interface UserInventoryAttributes {
  userId: string;
  guildId: string;
  itemId: number;
  itemType: ItemTypes;
  quantity: number;
  equipped: boolean;
}

export interface UserInventoryInstance
  extends Model<UserInventoryAttributes, UserInventoryAttributes>,
    UserInventoryAttributes {
  fish?: FishInstance;
  fishingRod?: FishingRodInstance;
  bait?: BaitInstance;
}

export const UserInventory = database.connection.define<UserInventoryInstance>(
  "UserInventory",
  {
    userId: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    guildId: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    itemId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    itemType: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    quantity: {
      allowNull: false,
      type: DataTypes.NUMBER,
      defaultValue: 0,
    },
    equipped: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { tableName: "user_inventory", timestamps: false }
);

UserInventory.belongsTo(Fish, {
  as: "fish",
  foreignKey: "itemId",
  constraints: false,
});

UserInventory.belongsTo(FishingRod, {
  as: "fishingRod",
  foreignKey: "itemId",
  constraints: false,
});

UserInventory.belongsTo(Bait, {
  as: "bait",
  foreignKey: "itemId",
  constraints: false,
});
