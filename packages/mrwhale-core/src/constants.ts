import { CommandTypes } from "./types/command-types";

export const WHALE_REGEX = /O_{1,5}O/gi;

export const DEFAULT_COMMAND_RATE_LIMIT = 1;
export const DEFAULT_COMMAND_COOLDOWN_DURATION = 1000;

export const COMMAND_TYPE_NAMES: CommandTypes[] = [
  "admin",
  "fun",
  "game",
  "utility",
  "useful",
  "image",
  "level",
];
