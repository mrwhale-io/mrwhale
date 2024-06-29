import * as express from "express";

import {
  DEFAULT_RANK_THEME,
  HttpStatusCode,
  RankCardTheme,
  createPlayerRankCard,
} from "@mrwhale-io/core";
import { ensureAuthenticated } from "../middleware/ensure-authenticated";
import { validate } from "../middleware/validators/shared";
import {
  guildRankCardThemeValidators,
  guildSetPrefixValidators,
} from "../middleware/validators/guilds";
import {
  deleteLevelChannelForGuild,
  getGuildSettings,
  setLevelChannelForGuild,
  setPrefixForGuild,
  toggleLevelsForGuild,
  setRankCardThemeForGuild,
} from "../services/guild";
import {
  getFormattedGuild,
  getFormattedPlayerInfo,
} from "../formatters/guilds";
import { asyncRequestHandler } from "../middleware/async";
import { userCanManageGuild } from "../middleware/guilds";
import { LevelManager } from "../../client/managers/level-manager";

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
guildsRouter.delete(
  "/:guildId",
  ensureAuthenticated(),
  asyncRequestHandler(userCanManageGuild),
  deleteGuildData
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
guildsRouter.get(
  "/:guildId/card",
  ensureAuthenticated(),
  asyncRequestHandler(userCanManageGuild),
  getRankCard
);
guildsRouter.put(
  "/:guildId/card",
  ensureAuthenticated(),
  asyncRequestHandler(userCanManageGuild),
  validate(guildRankCardThemeValidators),
  setRankCardTheme
);
guildsRouter.delete(
  "/:guildId/card",
  ensureAuthenticated(),
  asyncRequestHandler(userCanManageGuild),
  ressetRankCardTheme
);

async function getGuild(req: express.Request, res: express.Response) {
  const { guildId } = req.params;
  const settings = await getGuildSettings(guildId);
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

async function getRankCard(req: express.Request, res: express.Response) {
  const { guildId } = req.params;
  const guildSettings = await getGuildSettings(guildId);
  const user = await req.botClient.client.users.fetch(req.user.id);
  const info = await getFormattedPlayerInfo(user);
  const canvas = await createPlayerRankCard({
    player: info,
    theme: guildSettings.rankCard,
    defaultTheme: DEFAULT_RANK_THEME,
  });
  const image = canvas.toBuffer();

  return res
    .writeHead(HttpStatusCode.OK, {
      "Content-Type": "image/png",
      "Content-Length": image.length,
    })
    .end(image);
}

async function setRankCardTheme(req: express.Request, res: express.Response) {
  const { guildId } = req.params;
  const botClient = req.botClient;
  const rankCardTheme: RankCardTheme = {
    fillColour: req.body.fillColour || DEFAULT_RANK_THEME.fillColour,
    primaryTextColour:
      req.body.primaryTextColour || DEFAULT_RANK_THEME.primaryTextColour,
    secondaryTextColour:
      req.body.secondaryTextColour || DEFAULT_RANK_THEME.secondaryTextColour,
    progressFillColour:
      req.body.progressFillColour || DEFAULT_RANK_THEME.progressFillColour,
    progressColour:
      req.body.progressColour || DEFAULT_RANK_THEME.progressColour,
    font: DEFAULT_RANK_THEME.font,
  };

  await setRankCardThemeForGuild(guildId, rankCardTheme, botClient);

  return res.status(HttpStatusCode.OK).end();
}

async function ressetRankCardTheme(
  req: express.Request,
  res: express.Response
) {
  const { guildId } = req.params;
  const botClient = req.botClient;

  await setRankCardThemeForGuild(guildId, DEFAULT_RANK_THEME, botClient);

  return res.status(HttpStatusCode.OK).end();
}

async function deleteGuildData(req: express.Request, res: express.Response) {
  const guildId = req.params.guildId;
  const botClient = req.botClient;

  if (botClient.guildSettings.has(guildId)) {
    await botClient.deleteGuildSettings(guildId);
    await botClient.loadGuildSettings(guildId);
  }
  await LevelManager.removeAllScoresForGuild(guildId);

  return res.status(HttpStatusCode.OK).end();
}
