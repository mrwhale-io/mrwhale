import { User } from "@mrwhale-io/gamejolt";

export interface PlayerInfo {
  user: User;
  totalExp: number;
  levelExp: number;
  remainingExp: number;
  level: number;
  rank: number;
}
