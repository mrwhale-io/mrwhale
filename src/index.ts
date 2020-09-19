import { BotClient } from "./bot-client";

const config = require("../config.json");

try {
  new BotClient(
    {
      userId: config.userId,
      frontend: config.frontend,
    },
    {
      prefix: "!",
      cleverbotToken: config.cleverbot,
    }
  );
} catch (error) {
  console.error(error);
}
