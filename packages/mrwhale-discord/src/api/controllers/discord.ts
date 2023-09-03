import * as express from "express";
import { request } from "undici";
import { Guild, User } from "discord.js";

import { encodeBase64 } from "../../util/encode-base64";
import { OAuthTokenResponse } from "../../types/oauth-token-response";
import { CallbackResponse } from "../../types/callback-response";

export const discordRouter = express.Router();

discordRouter.get("/login", login);
discordRouter.get("/callback", callback);

async function login(req: express.Request, res: express.Response) {
  if (!req.user) {
    return res.redirect(
      `https://discord.com/oauth2/authorize?client_id=${
        req.botClient.client.user.id
      }&scope=identify%20guilds&response_type=code&redirect_uri=${
        req.botClient.apiBaseUrl + "/api/callback"
      }&state=${req.query.state || "no"}`
    );
  }
  return res.redirect("/");
}

async function callback(req: express.Request, res: express.Response) {
  if (!req.query.code) {
    return res.status(400).json({ error: "Missing authorization code." }).end();
  }

  const oauthData = await getOAuthToken(req);
  const response: CallbackResponse = {
    user: null,
    guilds: [],
    accessToken: "",
  };

  response.user = await getDiscordUser(
    oauthData.token_type,
    oauthData.access_token
  );

  response.guilds = await getGuilds(
    oauthData.token_type,
    oauthData.access_token
  );
  response.accessToken = oauthData.access_token;

  return res.status(200).json(response).end();
}

async function getOAuthToken(
  req: express.Request
): Promise<OAuthTokenResponse> {
  const params = new URLSearchParams({
    client_id: req.botClient.clientId,
    client_secret: req.botClient.clientSecret,
    code: req.query.code as string,
    grant_type: "authorization_code",
    redirect_uri: `${req.botClient.apiBaseUrl}/api/callback`,
    scope: "identify",
  });

  const tokenResponseData = await request(
    "https://discord.com/api/oauth2/token",
    {
      method: "POST",
      body: params.toString(),
      headers: {
        Authorization: `Basic ${encodeBase64(
          `${req.botClient.client.user.id}:${req.botClient.clientSecret}`
        )}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return (await tokenResponseData.body.json()) as OAuthTokenResponse;
}

async function getDiscordUser(
  tokenType: string,
  accessToken: string
): Promise<User> {
  const userResult = await request("https://discord.com/api/users/@me", {
    headers: {
      authorization: `${tokenType} ${accessToken}`,
    },
  });

  return (await userResult.body.json()) as User;
}

async function getGuilds(
  tokenType: string,
  accessToken: string
): Promise<Guild[]> {
  const guildsResult = await request(
    "https://discord.com/api/users/@me/guilds",
    {
      headers: {
        authorization: `${tokenType} ${accessToken}`,
      },
    }
  );

  return (await guildsResult.body.json()) as Guild[];
}
