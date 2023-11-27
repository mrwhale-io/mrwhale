import * as express from "express";

import { HttpStatusCode } from "@mrwhale-io/core";
import { getTotalMemberCount } from "../services/client";
import { AVATAR_OPTIONS } from "../../constants";

export const clientRouter = express.Router();

clientRouter.get("/", getClientInfo);

async function getClientInfo(req: express.Request, res: express.Response) {
  const { user } = req.botClient.client;
  const clientInfo = {
    user: {
      id: user.id,
      username: user.username,
      avatar: user.displayAvatarURL(AVATAR_OPTIONS),
    },
    clientId: req.botClient.clientId,
    userCount: getTotalMemberCount(req.botClient),
    version: req.botClient.version,
  };

  return res.status(HttpStatusCode.OK).json(clientInfo).end();
}
