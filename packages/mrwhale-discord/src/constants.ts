import { GatewayIntentBits, ImageURLOptions } from "discord.js";

export const EMBED_COLOR = "#71b8ce";
export const INTENTS = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildMessageReactions,
];
export const DISCORD_URL = "https://discord.com";
export const DISCORD_API_VERSION = "v10";
export const PREFIX_MAX_LENGTH = 10;
export const THEME = {
  backgroundColour: "#002b3d",
  secondaryBackgroundColour: "#71b8ce",
  primaryTextColour: "#ffffff",
  secondaryTextColour: "#88f9ba",
  font: "28px sans-serif",
};
export const HEX_COLOUR_REGEX = /^#[0-9A-F]{6}$/i;
export const MAX_EMBED_DESCRIPTION_LENGTH = 4096;
export const MAX_EMBED_FIELD_VALUE_LENGTH = 1024;
export const AVATAR_OPTIONS: ImageURLOptions = { extension: "png", size: 512 };
export const HIGHSCORE_PAGE_LIMIT = 10;
export const HIGHSCORE_MAX_LIMIT = 100;
