import * as express from "express";

import { HttpStatusCode } from "@mrwhale-io/core";
import { ensureAuthenticated } from "../middleware/ensure-authenticated";
import { validate } from "../middleware/validators/shared";
import { guildSetPrefixValidators } from "../middleware/validators/guilds";
import {
  deleteLevelChannelForGuild,
  getGuildSettings,
  setLevelChannelForGuild,
  setPrefixForGuild,
  toggleLevelsForGuild,
} from "../services/guild";
import { getFormattedGuild } from "../formatters/guilds";
import { asyncRequestHandler } from "../middleware/async";
import { userCanManageGuild } from "../middleware/guilds";

interface GuildLevelChannel {
  channelId: string;
}

interface GuildPrefix {
  prefix: string;
}

export const guildsRouter = express.Router();

guildsRouter.get(
  "/:guildId",
  ensureAuthenticated(),
  asyncRequestHandler(userCanManageGuild),
  getGuild
);
guildsRouter.patch(
  "/:guildId/prefix",
  ensureAuthenticated(),
  asyncRequestHandler(userCanManageGuild),
  validate(guildSetPrefixValidators),
  setGuildPrefix
);
guildsRouter.patch(
  "/:guildId/levels",
  ensureAuthenticated(),
  asyncRequestHandler(userCanManageGuild),
  setGuildLevels
);
guildsRouter.patch(
  "/:guildId/level-channel",
  ensureAuthenticated(),
  asyncRequestHandler(userCanManageGuild),
  setGuildLevelChannel
);

async function getGuild(req: express.Request, res: express.Response) {
  const settings = await getGuildSettings(req.params.guildId);
  const formattedGuild = getFormattedGuild(req.guild);

  return res.json({ guild: formattedGuild, settings });
}

async function setGuildLevels(req: express.Request, res: express.Response) {
  const status = await toggleLevelsForGuild(req.params.guildId, req.botClient);

  return res.status(HttpStatusCode.OK).json({ status });
}

async function setGuildLevelChannel(
  req: express.Request,
  res: express.Response
) {
  const guildId = req.params.guildId;
  const guild = req.guild;
  const { channelId }: GuildLevelChannel = req.body;

  if (!channelId) {
    await deleteLevelChannelForGuild(guildId, req.botClient);

    return res.status(HttpStatusCode.OK).end();
  }

  if (!guild.channels.cache.some((channel) => channel.id === channelId)) {
    return res
      .status(HttpStatusCode.BAD_REQUEST)
      .json({ message: "Channel id is invalid." });
  }

  await setLevelChannelForGuild(guildId, channelId, req.botClient);

  return res.status(HttpStatusCode.OK).end();
}

async function setGuildPrefix(req: express.Request, res: express.Response) {
  const { prefix }: GuildPrefix = req.body;

  await setPrefixForGuild(prefix, req.params.guildId, req.botClient);

  return res.status(HttpStatusCode.OK).end();
}
