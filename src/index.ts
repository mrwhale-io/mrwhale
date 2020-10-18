import { BotClient } from "./bot-client";

const config = require("../config.json");

try {
  new BotClient(
    {
      userId: config.userId,
      frontend: config.frontend,
      baseApiUrl: "http://development.gamejolt.com/site-api",
      baseChatUrl: "http://chat.development.gamejolt.com/chatex",
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
