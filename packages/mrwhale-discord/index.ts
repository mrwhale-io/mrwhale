import { ActivityType, Events } from "discord.js";
import * as path from "path";

import { SqliteStorageProvider } from "@mrwhale-io/core";
import * as config from "./config.json";
import { version } from "./package.json";
import { DiscordBotClient } from "./src/client/discord-bot-client";
import { INTENTS } from "./src/constants";
import { startServer } from "./server";

const SET_ACTIVITY_INTERVAL = 60 * 1000; // 1 minute
const ACTIVITIES = [
  {
    text: "🦈Swimming upside down and pretending to be a shark.",
    type: ActivityType.Custom,
  },
  {
    text: "🎤Singing whale songs to the moon.",
    type: ActivityType.Custom,
  },
  {
    text: "🫧Trying to catch seagulls with bubble rings.",
    type: ActivityType.Custom,
  },
  {
    text: "hide and seek with a giant squid.",
    type: ActivityType.Playing,
  },
  {
    text: "🍳Hosting a plankton cooking competition.",
    type: ActivityType.Custom,
  },
  {
    text: "🐳Attempting to dance the 'whale waltz' with passing ships.",
    type: ActivityType.Custom,
  },
  {
    text: "🐟Organizing a synchronized swimming performance for fish.",
    type: ActivityType.Custom,
  },
  {
    text: "🐬Practicing flips and somersaults in the ocean currents.",
    type: ActivityType.Custom,
  },
  {
    text: "🦐Holding a debate with other whales about the best type of krill.",
    type: ActivityType.Custom,
  },
  {
    text: "🎷Learning to play the saxophone underwater.",
    type: ActivityType.Custom,
  },
  {
    text: "in the underwater Olympics",
    type: ActivityType.Competing,
  },
];

const bot = new DiscordBotClient(
  {
    commandsDir: path.join(__dirname, "./src/commands"),
    selectMenuDir: path.join(__dirname, "./src/select-menus"),
    buttonsDir: path.join(__dirname, "./src/buttons"),
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
  bot.discordSelectMenuHandler.ready = true;
  bot.discordButtonHandler.ready = true;
  setActivity();
  setInterval(setActivity, SET_ACTIVITY_INTERVAL);
});

process.on("unhandledRejection", (err) => {
  console.error(err);
});

function setActivity() {
  const { text, type } = ACTIVITIES[
    Math.floor(Math.random() * ACTIVITIES.length)
  ];

  bot.client.user.setActivity(text, { type });
}

startServer(bot);
