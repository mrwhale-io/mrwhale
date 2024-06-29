import { Model, DataTypes } from "sequelize";

import { AchievementCriteria } from "@mrwhale-io/core";
import { database } from "..";

export interface AchievementAttributes {
  id: number;
  name: string;
  description: string;
  icon: string;
  criteria: AchievementCriteria;
}

export interface AchievementInstance
  extends Model<AchievementAttributes, AchievementAttributes>,
    AchievementAttributes {}

export const Achievement = database.connection.define<AchievementInstance>(
  "Achievement",
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
    },
    description: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    icon: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    criteria: {
      allowNull: false,
      type: DataTypes.JSON,
    },
  },
  { tableName: "achievements", timestamps: false }
);
