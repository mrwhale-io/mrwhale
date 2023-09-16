import session from "express-session";
import { User } from "discord.js";

declare module "express-session" {
  export interface SessionData {
    user: User;
    tokenType: string; 
    accessToken: string;
  }
}
