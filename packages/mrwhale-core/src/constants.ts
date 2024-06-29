import { CommandTypes } from "./types/command-types";
import { FishRarity } from "./types/fish-rarity";
import { RankCardTheme } from "./types/rank-card-theme";

export const WHALE_REGEX = /O_{1,5}O/gi;

export const DEFAULT_COMMAND_RATE_LIMIT = 1;
export const DEFAULT_COMMAND_COOLDOWN_DURATION = 1000;

export const COMMAND_TYPE_NAMES: CommandTypes[] = [
  "admin",
  "economy",
  "fishing",
  "fun",
  "game",
  "utility",
  "useful",
  "image",
  "level",
];

export const DEFAULT_RANK_THEME: RankCardTheme = {
  fillColour: "#001625",
  primaryTextColour: "#ffffff",
  secondaryTextColour: "#88f9ba",
  progressFillColour: "#002b3d",
  progressColour: "#71b8ce",
  font: "28px sans-serif",
};

export const FISH_RARITY_ICONS: { [key in FishRarity]: string } = {
  Common: "🌿",
  Uncommon: "🌟",
  Rare: "💎",
  Epic: "🏆",
  Legendary: "🌈",
};
