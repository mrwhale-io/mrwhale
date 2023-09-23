import { Guild } from "../types/guild";

export const getGuildIcon = (guild: Guild) => {
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=512`;
};
