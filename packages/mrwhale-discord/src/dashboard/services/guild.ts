import { APIGuild } from "discord.js";
import { request } from "undici";

import { DISCORD_URL } from "../../constants";

/**
 * Makes a call to the discord api to fetch the current user's guilds.
 * @param tokenType The type of token.
 * @param accessToken The user's access token issued by the discord api.
 */
export async function getGuilds(
  tokenType: string,
  accessToken: string
): Promise<APIGuild[]> {
  const guildsResult = await request(`${DISCORD_URL}/api/users/@me/guilds`, {
    headers: {
      authorization: `${tokenType} ${accessToken}`,
    },
  });

  return (await guildsResult.body.json()) as APIGuild[];
}
