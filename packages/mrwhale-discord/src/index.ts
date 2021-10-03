import { Intents } from "discord.js";

import * as config from "../config.json";
import { DiscordBotClient } from "./client/discord-bot-client";

const bot = new DiscordBotClient(
  {
    prefix: config.prefix,
    ownerId: config.ownerId,
  },
  { intents: [Intents.FLAGS.GUILDS] }
);

bot.client.login(config.token);

bot.client.on("ready", () => {
  bot.commandDispatcher.ready = true;
});
