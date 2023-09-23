import { SqliteStorageProvider } from "@mrwhale-io/core";
import { Events } from "discord.js";
import * as path from "path";

import * as config from "./config.json";
import { version } from "./package.json";
import { DiscordBotClient } from "./src/client/discord-bot-client";
import { INTENTS } from "./src/constants";
import { startServer } from "./server";

const bot = new DiscordBotClient(
  {
    commandsDir: path.join(__dirname, "./src/commands"),
    prefix: config.prefix,
    ownerId: config.ownerId,
    discordServer: config.discordServer,
    discordBotList: config.discordBotList,
    redirectUrl: config.redirectUrl,
    proxyUrl: config.proxyUrl,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    version,
    provider: SqliteStorageProvider(path.join(process.cwd(), config.database)),
  },
  {
    intents: INTENTS,
  }
);

bot.client.login(config.token);

bot.client.once(Events.ClientReady, () => {
  bot.commandDispatcher.ready = true;
  bot.client.user.setActivity(`in ${bot.client.guilds.cache.size} servers`);
});

process.on("unhandledRejection", (err) => {
  console.error(err);
});

startServer(bot);
