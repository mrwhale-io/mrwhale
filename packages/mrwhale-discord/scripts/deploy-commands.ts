import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

import { clientId, token } from "../config.json";
import { loadSlashCommands } from "./load-slash-commands";

const rest = new REST({ version: "9" }).setToken(token);

rest
  .put((Routes as any).applicationCommands(clientId), {
    body: loadSlashCommands(),
  })
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
