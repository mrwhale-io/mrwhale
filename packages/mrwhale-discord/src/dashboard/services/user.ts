import { User } from "discord.js";
import { request } from "undici";

import { DiscordErrorResponse } from "../../types/api/discord-error-response";
import { DISCORD_API_VERSION, DISCORD_URL } from "../../constants";

/**
 * Makes a call to the discord api to fetch the current user.
 * @param tokenType The type of token.
 * @param accessToken The user's access token issued by the discord api.
 */
export async function getDiscordUser(
  tokenType: string,
  accessToken: string
): Promise<User | DiscordErrorResponse> {
  const userResult = await request(
    `${DISCORD_URL}/api/${DISCORD_API_VERSION}/users/@me`,
    {
      headers: {
        authorization: `${tokenType} ${accessToken}`,
      },
    }
  );

  return (await userResult.body.json()) as User | DiscordErrorResponse;
}
