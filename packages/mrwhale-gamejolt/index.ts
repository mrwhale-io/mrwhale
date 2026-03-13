import * as path from "path";
import { SqliteStorageProvider } from "@mrwhale-io/core";

import { GameJoltBotClient } from "./src/client/gamejolt-bot-client";
import * as config from "./config.json";

const client = new GameJoltBotClient(
  {
    userId: config.userId,
    frontend: config.frontend,
    mrwhaleToken: config.mrwhaleToken,
    baseApiUrl: config.baseApiUrl,
    baseGridUrl: config.baseGridUrl,
    rateLimitRequests: 3,
  },
  {
    commandsDir: path.join(__dirname, "./src/commands"),
    cleverbotToken: config.cleverbot,
    prefix: config.prefix,
    ownerId: config.ownerId,
    privateKey: config.privateKey,
    gameId: config.gameId,
    provider: SqliteStorageProvider(path.join(process.cwd(), config.database)),
  },
);

process.on("unhandledRejection", (err) => client.logger.error(err));

process.on("SIGINT", () => {
  client.logger.info("Shutting down gracefully...");
  client.destroy().then(() => {
    client.logger.info("Shutdown complete. Exiting process.");
    process.exit(0);
  });
});
