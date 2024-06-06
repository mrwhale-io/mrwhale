import { Model, DataTypes } from "sequelize";
import { database } from "..";

interface UserAchievementAttributes {
  userId: string;
  guildId: string;
  achievementId: number;
  achievedAt: Date;
}

export interface UserAchievementInstance
  extends Model<UserAchievementAttributes, UserAchievementAttributes>,
    UserAchievementAttributes {}

export const UserAchievement = database.connection.define<UserAchievementInstance>(
  "UserAchievement",
  {
    userId: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    guildId: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    achievementId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    achievedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  { tableName: "user_achievements", timestamps: false }
);
