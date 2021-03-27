import { BotClient } from "./src/bot-client";
import * as config from "./config.json";

const client = new BotClient(
  {
    userId: config.userId,
    frontend: config.frontend,
    baseApiUrl: config.baseApiUrl,
    baseChatUrl: config.baseChatUrl,
    baseGridUrl: config.baseGridUrl,
    rateLimitRequests: 3,
  },
  {
    prefix: "!",
    cleverbotToken: config.cleverbot,
    ownerId: config.ownerId,
    privateKey: config.privateKey,
    gameId: config.gameId,
  }
);

process.on("unhandledRejection", (err) => client.logger.error(err));
