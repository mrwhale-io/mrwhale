import { GatewayIntentBits } from "discord.js";

export const EMBED_COLOR = "#71b8ce";
export const INTENTS = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.DirectMessages,
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
