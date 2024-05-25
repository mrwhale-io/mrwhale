import { Guild, User } from "discord.js";

export interface CallbackResponse {
  user: User;
  guilds: Guild[];
  accessToken: string;
}
