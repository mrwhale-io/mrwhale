import * as express from "express";
import * as session from "express-session";
import * as path from "path";

import * as config from "./config.json";
import { DiscordBotClient } from "./src/client/discord-bot-client";
import { discordRouter } from "./src/api/controllers/discord";

const app = express();

export function startServer(botClient: DiscordBotClient) {
  app
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use(express.static(path.join(__dirname, "/public")))
    .use(
      session({
        secret: config.sessionSecret,
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

  app.use("/api", discordRouter);

  app.listen(config.port, () =>
    console.log(`App listening at ${config.apiBaseUrl}`)
  );
}
