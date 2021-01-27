import { CommandoClient } from "discord.js-commando";
import * as path from "path";

import * as config from "./config.json";

const client = new CommandoClient({
  commandPrefix: "!",
  owner: config.discordOwnerId,
  invite: config.supportServer,
});

client.registry
  .registerDefaultTypes()
  .registerDefaultGroups()
  .registerDefaultCommands()
  .registerGroups([["fun", "Fun"]])
  .registerCommandsIn({
    filter: /^([^.].*)\.(js|ts)$/,
    dirname: path.join(__dirname, "commands", "discord"),
  });

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
  client.user.setActivity("in the ocean");
});

client.on("error", console.error);

client.login(config.discordToken);
