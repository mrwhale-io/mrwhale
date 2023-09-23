import { Guild, User } from "discord.js";

import { DiscordBotClient } from "../../src/client/discord-bot-client";

export {};

declare global {
  namespace Express {
    export interface Request {
      guild?: Guild;
      botClient: DiscordBotClient;
      user?: User;
    }
  }
}
