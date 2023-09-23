import * as express from "express";

import { HttpStatusCode } from "@mrwhale-io/core";
import { getTotalMemberCount } from "../services/client";

export const clientRouter = express.Router();

clientRouter.get("/", getClientInfo);

async function getClientInfo(req: express.Request, res: express.Response) {
  const { user } = req.botClient.client;
  const clientInfo = {
    user: {
      id: user.id,
      username: user.username,
      avatar: user.displayAvatarURL({ extension: "png", size: 512 }),
    },
    clientId: req.botClient.clientId,
    userCount: getTotalMemberCount(req.botClient),
    version: req.botClient.version,
  };

  return res.status(HttpStatusCode.OK).json(clientInfo).end();
}
