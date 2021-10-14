import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

import { clientId, guildId, token } from "../config.json";
import { loadSlashCommands } from "./deploy-commands";

const rest = new REST({ version: "9" }).setToken(token);

rest
  .put((Routes as any).applicationGuildCommands(clientId, guildId), {
    body: loadSlashCommands(),
  })
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
