import * as express from "express";

import { commandsRouter } from "./commands";
import { clientRouter } from "./client";
import { usersRouter } from "./users";

export const apiRouter = express.Router();

apiRouter.use("/commands", commandsRouter);
apiRouter.use("/client", clientRouter);
apiRouter.use("/users", usersRouter);
