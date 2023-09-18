import * as express from "express";

import { HttpStatusCode } from "@mrwhale-io/core";
import { ensureAuthenticated } from "../middleware/ensure-authenticated";
import { validate } from "../middleware/validators/shared";
import {
  guildSetMessageChannelValidators,
  guildSetPrefixValidators,
} from "../middleware/validators/guilds";
import {
  getGuildSettings,
  setLevelChannelForGuild,
  setPrefixForGuild,
  toggleLevelsForGuild,
} from "../services/guild";
import { getFormattedGuild } from "../formatters/guilds";

interface GuildMessageChannel {
  channelId: string;
}

interface GuildPrefix {
  prefix: string;
}

export const guildsRouter = express.Router();

guildsRouter.get("/:guildId", ensureAuthenticated(), getGuild);
guildsRouter.patch(
  "/:guildId/prefix",
  ensureAuthenticated(),
  validate(guildSetPrefixValidators),
  setGuildPrefix
);
guildsRouter.patch("/:guildId/levels", ensureAuthenticated(), setGuildLevels);
guildsRouter.patch(
  "/:guildId/message-channel",
  ensureAuthenticated(),
  validate(guildSetMessageChannelValidators),
  setGuildMessageChannel
);

async function getGuild(req: express.Request, res: express.Response) {
  const guildId = req.params.guildId;
  const guild = await req.botClient.client.guilds.fetch(guildId);

  if (!guild) {
    return res.status(HttpStatusCode.NOT_FOUND).end();
  }

  const settings = await getGuildSettings(guildId);
  const formattedGuild = getFormattedGuild(guild);

  return res.json({ guild: formattedGuild, settings });
}

async function setGuildLevels(req: express.Request, res: express.Response) {
  const guildId = req.params.guildId;

  const status = await toggleLevelsForGuild(guildId, req.botClient);

  return res.status(HttpStatusCode.OK).json({ status });
}

async function setGuildMessageChannel(
  req: express.Request,
  res: express.Response
) {
  const guildId = req.params.guildId;
  const guild = await req.botClient.client.guilds.fetch(guildId);
  const { channelId }: GuildMessageChannel = req.body;

  if (!guild.channels.cache.some((channel) => channel.id === channelId)) {
    return res
      .status(HttpStatusCode.BAD_REQUEST)
      .json({ error: "Channel id is invalid." });
  }

  await setLevelChannelForGuild(guildId, channelId, req.botClient);

  return res.status(HttpStatusCode.OK).end();
}

async function setGuildPrefix(req: express.Request, res: express.Response) {
  const guildId = req.params.guildId;
  const { prefix }: GuildPrefix = req.body;

  await setPrefixForGuild(prefix, guildId, req.botClient);

  return res.status(HttpStatusCode.OK).end();
}
