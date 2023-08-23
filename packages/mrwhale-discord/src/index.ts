import { SqliteStorageProvider } from "@mrwhale-io/core";
import * as path from "path";

import * as config from "../config.json";
import { DiscordBotClient } from "./client/discord-bot-client";
import { INTENTS } from "./constants";

const bot = new DiscordBotClient(
  {
    commandsDir: path.join(__dirname, "./commands"),
    prefix: config.prefix,
    ownerId: config.ownerId,
    provider: SqliteStorageProvider(path.join(process.cwd(), config.database))
  },
  {
    intents: INTENTS,
  }
);

bot.client.login(config.token);

bot.client.on("ready", () => {
  bot.commandDispatcher.ready = true;
  bot.client.user.setActivity(`in ${bot.client.guilds.cache.size} servers`);
});

process.on("unhandledRejection", (err) => {
	console.error(err);
});
