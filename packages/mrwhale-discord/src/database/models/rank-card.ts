import { Model, DataTypes } from "sequelize";
import { database } from "..";

interface RankCardAttributes {
  guildId: string;
  fillColour: string;
  primaryTextColour: string;
  secondaryTextColour: string;
  progressFillColour: string;
  progressColour: string;
}

export interface RankCardInstance
  extends Model<RankCardAttributes, RankCardAttributes>,
    RankCardAttributes {}

export const RankCard = database.connection.define<RankCardInstance>(
  "RankCard",
  {
    guildId: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    fillColour: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    primaryTextColour: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    secondaryTextColour: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    progressFillColour: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    progressColour: {
      allowNull: false,
      type: DataTypes.STRING,
    },
  },
  { tableName: "rank_cards", timestamps: false }
);
