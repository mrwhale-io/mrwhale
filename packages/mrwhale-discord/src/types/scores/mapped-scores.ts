import { User } from "discord.js";

export interface MappedScores {
  exp: number;
  user: User;
  level?: number;
}
