import * as express from "express";
import { request } from "undici";

import { HttpStatusCode } from "@mrwhale-io/core";
import { encodeBase64 } from "../../util/encode-base64";
import { OAuthTokenResponse } from "../../types/oauth-token-response";
import { DISCORD_API_VERSION, DISCORD_URL } from "../../constants";
import { getDiscordUser } from "../services/user";

export const authRouter = express.Router();

authRouter.get("/login", login);
authRouter.get("/logout", logout);
authRouter.get("/callback", callback);

async function login(req: express.Request, res: express.Response) {
  if (!req.session.user) {
    return res.redirect(
      `${DISCORD_URL}/oauth2/authorize?client_id=${
        req.botClient.client.user.id
      }&scope=identify%20guilds&response_type=code&redirect_uri=${
        req.botClient.redirectUrl
      }&state=${req.query.state || "no"}`
    );
  }

  return res.redirect(`${req.botClient.proxyUrl}/dashboard`);
}

async function logout(req: express.Request, res: express.Response) {
  if (req.session.user) {
    req.session.destroy((error) => console.log(error));
  }

  return res.redirect(req.botClient.proxyUrl);
}

async function callback(req: express.Request, res: express.Response) {
  if (!req.query.code) {
    return res
      .status(HttpStatusCode.BAD_REQUEST)
      .send("Missing authorization code.")
      .end();
  }

  const oauthData = await getOAuthToken(req);
  const userData = await getDiscordUser(
    oauthData.token_type,
    oauthData.access_token
  );

  if ("code" in userData) {
    return res.status(HttpStatusCode.UNAUTHORIZED).end();
  }

  req.session.user = userData;
  req.session.accessToken = oauthData.access_token;
  req.session.tokenType = oauthData.token_type;

  return res.redirect(`${req.botClient.proxyUrl}/dashboard`);
}

async function getOAuthToken(
  req: express.Request
): Promise<OAuthTokenResponse> {
  const params = new URLSearchParams({
    client_id: req.botClient.clientId,
    client_secret: req.botClient.clientSecret,
    code: req.query.code as string,
    grant_type: "authorization_code",
    redirect_uri: req.botClient.redirectUrl,
    scope: "identify",
  });

  const tokenResponseData = await request(
    `${DISCORD_URL}/api/${DISCORD_API_VERSION}/oauth2/token`,
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
