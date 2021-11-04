import * as path from "path";
import { GameJoltBotClient } from "./client/gamejolt-bot-client";
import * as config from "../config.json";

const client = new GameJoltBotClient(
  {
    userId: config.userId,
    frontend: config.frontend,
    baseApiUrl: config.baseApiUrl,
    baseChatUrl: config.baseChatUrl,
    baseGridUrl: config.baseGridUrl,
    rateLimitRequests: 3,
  },
  {
    commandsDir: path.join(__dirname, "./commands"),
    cleverbotToken: config.cleverbot,
    prefix: config.prefix,
    ownerId: config.ownerId,
    privateKey: config.privateKey,
    gameId: config.gameId,
  }
);

process.on("unhandledRejection", (err) => client.logger.error(err));
