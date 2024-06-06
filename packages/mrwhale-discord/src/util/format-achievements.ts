import { bold } from "discord.js";

import { Achievement } from "@mrwhale-io/core";

export function formatAchievements(achievements: Achievement[]): string {
  return (
    achievements
      .map(
        (achievement) =>
          `${achievement.icon} ${bold(achievement.name)}: ${
            achievement.description
          }`
      )
      .join("\n") || "You have unlocked no achievements."
  );
}
