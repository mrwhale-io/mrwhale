import * as express from "express";
import * as session from "express-session";
import * as connectSessionSequelize from "connect-session-sequelize";
import * as path from "path";

import { Database } from "@mrwhale-io/core";
import * as config from "./config.json";
import { DiscordBotClient } from "./src/client/discord-bot-client";
import { apiRouter } from "./src/dashboard/controllers";
import { authRouter } from "./src/dashboard/controllers/auth";

const app = express();
const SequelizeStore = connectSessionSequelize(session.Store);

export function startServer(botClient: DiscordBotClient) {
  app
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use(express.static(path.join(__dirname, "/public")))
    .use(
      session({
        secret: config.sessionSecret,
        store: new SequelizeStore({
          db: Database.connection,
        }),
        resave: false,
        saveUninitialized: false,
      })
    )
    .use(async function (req, res, next) {
      req.user = req.session.user;
      req.botClient = botClient;
      next();
    })
    .set("port", config.port);
         
  app.use("/authorize", authRouter);
  app.use("/api", apiRouter);

  app.listen(config.port, () => console.log(`App listening on port: ${config.port}`));
}
