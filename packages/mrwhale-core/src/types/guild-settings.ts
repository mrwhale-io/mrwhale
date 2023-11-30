import { RankCardTheme } from "./rank-card-theme";

export interface GuildSettings {
  levels?: boolean;
  prefix?: string;
  levelChannel?: string;
  rankCard: RankCardTheme;
}
