import { SqliteStorageProvider } from "@mrwhale-io/core";
import * as path from "path";

import * as config from "../config.json";
import { MudgoltBotClient } from "./client/mudgolt-bot-client";
import { PLAYER_EVENT } from "./constants";

const bot = new MudgoltBotClient({
  commandsDir: path.join(__dirname, "./commands"),
  prefix: config.prefix,
  ownerId: config.ownerId,
  provider: SqliteStorageProvider(path.join(process.cwd(), config.database)),
});

bot.login(config.username);
bot.client.on(PLAYER_EVENT, (player) => {
  console.log(player);
});
