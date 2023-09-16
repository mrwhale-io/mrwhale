import * as express from "express";

import { HttpStatusCode } from "@mrwhale-io/core";
import { ensureAuthenticated } from "../middleware/ensure-authenticated";
import { getGuilds } from "../services/guild";

export const usersRouter = express.Router();

usersRouter.get("/current-user", ensureAuthenticated(), getCurrentUser);
usersRouter.get("/current-user/guilds", ensureAuthenticated(), getUserGuilds);

async function getCurrentUser(req: express.Request, res: express.Response) {
  return res.json({ user: req.session.user });
}

async function getUserGuilds(req: express.Request, res: express.Response) {
  const guildData = await getGuilds(
    req.session.tokenType,
    req.session.accessToken
  );

  if ("code" in guildData) {
    return res.status(HttpStatusCode.UNAUTHORIZED).json(guildData).end();
  }

  return res.json({ guilds: guildData.filter((guild) => guild.owner) });
}
