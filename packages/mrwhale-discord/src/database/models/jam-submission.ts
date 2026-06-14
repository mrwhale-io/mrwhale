import { Model, DataTypes } from "sequelize";
import { database } from "..";

interface JamSubmissionAttributes {
  id: number;
  jamId: number;
  userId: string;
  guildId: string;
  gameTitle: string;
  gameUrl: string;
  description: string | null;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface JamSubmissionInstance
  extends Model<JamSubmissionAttributes, Partial<JamSubmissionAttributes>>,
    JamSubmissionAttributes {}

export const JamSubmission = database.connection.define<JamSubmissionInstance>(
  "JamSubmission",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    jamId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: { model: "jams", key: "id" },
    },
    userId: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    guildId: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    gameTitle: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    gameUrl: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    description: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    submittedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "jam_submissions",
    timestamps: true,
    indexes: [
      { fields: ["jamId"] },
      { fields: ["userId", "guildId"] },
      { unique: true, fields: ["jamId", "userId"], name: "unique_submission_per_user_per_jam" },
    ],
  }
);
