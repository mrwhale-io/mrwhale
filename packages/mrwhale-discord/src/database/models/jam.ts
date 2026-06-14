import { Model, DataTypes } from "sequelize";
import { database } from "..";

export type JamStatus = "active" | "closed" | "cancelled";

interface JamAttributes {
  id: number;
  guildId: string;
  theme: string;
  weekNumber: number;
  status: JamStatus;
  startDate: Date;
  endDate: Date;
  winnerSubmissionId: number | null;
  discordEventId: string | null;
  announcementMessageId: string | null;
  lastDailyPromptDate: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JamInstance
  extends Model<JamAttributes, Partial<JamAttributes>>,
    JamAttributes {}

export const Jam = database.connection.define<JamInstance>(
  "Jam",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    guildId: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    theme: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    weekNumber: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    status: {
      allowNull: false,
      type: DataTypes.STRING,
      defaultValue: "active",
    },
    startDate: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    endDate: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    winnerSubmissionId: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },
    discordEventId: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    announcementMessageId: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    lastDailyPromptDate: {
      allowNull: true,
      type: DataTypes.STRING,
      comment: "Date in YYYY-MM-DD format of the last daily prompt posted",
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
    tableName: "jams",
    timestamps: true,
    indexes: [{ fields: ["guildId"] }, { fields: ["status"] }],
  },
);
