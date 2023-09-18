import * as express from "express";

import { HttpStatusCode } from "@mrwhale-io/core";
import { ensureAuthenticated } from "../middleware/ensure-authenticated";
import { getGuilds } from "../services/guild";
import { APIGuild, Client } from "discord.js";

interface MappedGuild extends APIGuild {
  isInvited: boolean;
}

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

  const guilds = guildData
    .filter((guild) => guild.owner)
    .map((guild) => mapGuild(guild, req.botClient.client));

  return res.json({ guilds });
}

function mapGuild(guild: APIGuild, client: Client): MappedGuild {
  return {
    ...guild,
    isInvited: client.guilds.cache.some((g) => g.id === guild.id),
  };
}
