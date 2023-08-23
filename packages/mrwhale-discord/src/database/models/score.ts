import { Model, DataTypes } from "sequelize";
import { database } from "..";

interface ScoreAttributes {
  userId: string;
  guildId: string;
  exp: number;
  total?: number;
}

export interface ScoreInstance
  extends Model<ScoreAttributes, ScoreAttributes>,
    ScoreAttributes {}

export const Score = database.connection.define<ScoreInstance>(
  "Score",
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
    exp: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
  },
  { tableName: "score", timestamps: false }
);
