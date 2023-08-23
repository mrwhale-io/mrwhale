import { User } from "discord.js";

export interface PlayerInfo {
  user: User;
  totalExp: number;
  levelExp: number;
  remainingExp: number;
  level: number;
  rank: number;
}
