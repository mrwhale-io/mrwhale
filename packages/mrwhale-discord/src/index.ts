import * as path from "path";
import { WHALE_REGEX } from "@mrwhale-io/core";
import { Intents, Message } from "discord.js";

import * as config from "../config.json";
import { DiscordBotClient } from "./client/discord-bot-client";

const bot = new DiscordBotClient(
  {
    commandsDir: path.join(__dirname, "./commands"),
    prefix: config.prefix,
    ownerId: config.ownerId,
  },
  {
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.DIRECT_MESSAGES,
    ],
  }
);

bot.client.login(config.token);

bot.client.on("ready", () => {
  bot.commandDispatcher.ready = true;
  bot.client.user.setActivity(`in ${bot.client.guilds.cache.size} servers`);
});

bot.client.on("messageCreate", (message: Message) => {
  if (message.author.id === config.clientId) {
    return;
  }

  const match = message.content.match(WHALE_REGEX);
  if (match) {
    message.channel.send(match[0]);
  }
});
