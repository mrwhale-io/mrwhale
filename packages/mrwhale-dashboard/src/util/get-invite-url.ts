const BASE_OAUTH_URL = "https://discord.com/oauth2/authorize";

export const getInviteUrl = (clientId: string) =>
  `${BASE_OAUTH_URL}?client_id=${clientId}&permissions=2147601408&scope=applications.commands+bot`;
