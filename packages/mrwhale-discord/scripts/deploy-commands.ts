import { REST, Routes } from "discord.js";

import { clientId, token } from "../config.json";
import { loadSlashCommands } from "../src/util/command/load-slash-commands";

const rest = new REST().setToken(token);

(async () => {
  try {
    const commands = loadSlashCommands();
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log(`Successfully reloaded application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();
