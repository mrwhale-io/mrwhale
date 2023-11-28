import * as express from "express";

import {
  HttpStatusCode,
  PlayerInfo,
  RankCardTheme,
  createPlayerRankCard,
  getLevelFromExp,
  getRemainingExp,
  levelToExp,
} from "@mrwhale-io/core";
import { ensureAuthenticated } from "../middleware/ensure-authenticated";
import { validate } from "../middleware/validators/shared";
import {
  guildGetRankCardValidators,
  guildSetPrefixValidators,
} from "../middleware/validators/guilds";
import {
  deleteLevelChannelForGuild,
  getGuildSettings,
  getRankCardTheme,
  setLevelChannelForGuild,
  setPrefixForGuild,
  toggleLevelsForGuild,
  updateRankCard,
} from "../services/guild";
import { getFormattedGuild } from "../formatters/guilds";
import { asyncRequestHandler } from "../middleware/async";
import { userCanManageGuild } from "../middleware/guilds";
import { DEFAULT_RANK_THEME } from "../../constants";
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
guildsRouter.post(
  "/:guildId/card",
  ensureAuthenticated(),
  asyncRequestHandler(userCanManageGuild),
  validate(guildGetRankCardValidators),
  editRankCard
);

async function getGuild(req: express.Request, res: express.Response) {
  const { guildId } = req.params;
  const settings = await getGuildSettings(guildId);
  const formattedGuild = getFormattedGuild(req.guild);
  const rankCard = await getRankCardTheme(guildId);

  return res.json({ guild: formattedGuild, settings, rankCard });
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
  const exp = 100;
  const level = getLevelFromExp(exp);
  const user = await req.botClient.client.users.fetch(req.user.id);
  const info: PlayerInfo = {
    username: user.username,
    avatarUrl: user.displayAvatarURL({ extension: "png" }),
    totalExp: exp,
    levelExp: levelToExp(level),
    remainingExp: getRemainingExp(exp / 2),
    level,
    rank: 1,
  };
  const { guildId } = req.params;
  const theme = await getRankCardTheme(guildId);
  const canvas = await createPlayerRankCard({
    player: info,
    theme,
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

async function editRankCard(req: express.Request, res: express.Response) {
  const { guildId } = req.params;
  const rankCard: RankCardTheme = {
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

  await updateRankCard(guildId, rankCard);

  return res.status(HttpStatusCode.OK).end();
}

async function deleteGuildData(req: express.Request, res: express.Response) {
  const guildId = req.params.guildId;
  const botClient = req.botClient;

  if (botClient.guildSettings.has(guildId)) {
    await botClient.deleteGuildSettings(guildId);
    await botClient.createGuildSettings(guildId);
  }
  await LevelManager.removeAllScoresForGuild(guildId);

  return res.status(HttpStatusCode.OK).end();
}
