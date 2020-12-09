import { BotClient } from "./bot-client";

import * as config from "../config.json";

try {
  new BotClient(
    {
      userId: config.userId,
      frontend: config.frontend,
      baseApiUrl: config.baseApiUrl,
      baseChatUrl: config.baseChatUrl,
    },
    {
      prefix: "!",
      cleverbotToken: config.cleverbot,
      ownerId: config.ownerId,
    }
  );
} catch (error) {
  console.error(error);
}
