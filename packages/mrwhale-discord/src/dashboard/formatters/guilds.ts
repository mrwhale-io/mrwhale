import { ChannelType, Guild, User } from "discord.js";

import {
  DEFAULT_RANK_THEME,
  GuildSettings,
  PlayerInfo,
  getLevelFromExp,
  getRemainingExp,
  levelToExp,
} from "@mrwhale-io/core";

/**
 * Returns a formatted guild used for api responses.
 * @param guild The guild to format.
 */
export function getFormattedGuild(guild: Guild) {
  const channels = guild.channels.cache
    .filter((channel) => channel.type === ChannelType.GuildText)
    .map((channel) => ({
      id: channel.id,
      name: channel.name,
    }));

  return {
    id: guild.id,
    name: guild.name,
    icon: guild.icon,
    channels,
  };
}

/**
 * Returns formatted guild settings.
 * @param settings The settings to format.
 */
export function getFormattedGuildSettings(
  settings: Partial<GuildSettings>
): Partial<GuildSettings> {
  return {
    ...settings,
    rankCard: settings.rankCard ?? DEFAULT_RANK_THEME,
  };
}

/**
 * Returns formatted player info including exp, level and rank.
 * @param user The discord user to get formatted player info for.
 */
export async function getFormattedPlayerInfo(user: User): Promise<PlayerInfo> {
  const exp = 100;
  const level = getLevelFromExp(exp);
  const info: PlayerInfo = {
    username: user.username,
    avatarUrl: user.displayAvatarURL({ extension: "png" }),
    totalExp: exp,
    levelExp: levelToExp(level),
    remainingExp: getRemainingExp(exp / 2),
    level,
    rank: 1,
  };

  return info;
}
