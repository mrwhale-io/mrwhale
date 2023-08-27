import { GatewayIntentBits } from "discord.js";

export const EMBED_COLOR = "#71b8ce";
export const INTENTS = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.DirectMessages,
];
