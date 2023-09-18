import * as express from "express";

import { commandsRouter } from "./commands";
import { clientRouter } from "./client";
import { usersRouter } from "./users";
import { guildsRouter } from "./guilds";

export const apiRouter = express.Router();

apiRouter.use("/commands", commandsRouter);
apiRouter.use("/client", clientRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/guilds", guildsRouter);
