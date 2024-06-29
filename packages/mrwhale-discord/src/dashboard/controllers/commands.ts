import * as express from "express";

import { HttpStatusCode } from "@mrwhale-io/core";
import { loadCommands } from "../../util/command/load-commands";

export const commandsRouter = express.Router();

commandsRouter.get("/", getCommands);

async function getCommands(req: express.Request, res: express.Response) {
  const commands = loadCommands().map((c) => ({
    name: c.name,
    description: c.description,
    type: c.type,
    usage: c.usage,
    aliases: c.aliases,
    examples: c.examples,
    guildOnly: c.guildOnly,
    permissions: c.callerPermissions
  }));

  return res.status(HttpStatusCode.OK).json({ commands }).end();
}
