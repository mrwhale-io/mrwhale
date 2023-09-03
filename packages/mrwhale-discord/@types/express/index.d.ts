import { User } from "discord.js";

import { DiscordBotClient } from "../../src/client/discord-bot-client";

export {};

declare global {
  namespace Express {
    export interface Request {
      botClient: DiscordBotClient;
      user?: User;
    }
  }
}
