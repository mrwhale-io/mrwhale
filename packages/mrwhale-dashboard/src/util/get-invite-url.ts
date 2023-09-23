const BASE_OAUTH_URL = "https://discord.com/oauth2/authorize";

export const getInviteUrl = (clientId: string) =>
  `${BASE_OAUTH_URL}?client_id=${clientId}&permissions=2147601408&scope=applications.commands+bot`;

export const getInviteUrlForGuild = (clientId: string, guildId: string) =>
  `${getInviteUrl(clientId)}&guild_id=${guildId}`;
