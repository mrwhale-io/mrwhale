import { TimeUtilities } from "@mrwhale-io/core";
import { ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";

import { EMBED_COLOR } from "../../constants";
import { DiscordBotClient } from "../../client/discord-bot-client";

interface BotInfo {
  memoryUsage: number;
  systemUptime: number;
  botLatency: number;
  description: string;
}

const FRACTIONAL_DIGITS = 2;
const MEM_UNIT = 1024;
const FEATURES = [
  {
    title: "**🎣 Fishing Game**",
    subtitle:
      "Dive into the exciting fishing game with the following commands:",
    items: [
      "`/catch`: Try your luck and catch a variety of fish. Some are common, while others are rare and valuable!",
      "`/feed`: Feed your caught fish to me and increase my satiety to earn rewards like EXP and gems.",
      "`/whalemood`: See my current mood and satiety level in the server.",
    ],
  },
  {
    title: "**🛠️ Utility Features**",
    subtitle: "",
    items: [
      "`/help`: Explore all available commands and see how I can assist you.",
      "`/announcementchannel`: Set the channel all my bot announcements will get sent to.",
      "`/levelchannel`: Set an announcement channel for level ups.",
    ],
  },
  {
    title: "**🏅 Rank and Leaderboards**",
    subtitle: "",
    items: [
      "`/rank`: View your personalized rank card showcasing your achievements and progress.",
      "`/leaderboard`: Check out the top players in your server or globally.",
    ],
  },
  {
    title: "**🎉 Fun & Games**",
    subtitle: "",
    items: [
      "`/hangman`: Play the classic word-guessing game, Hangman, with your friends.",
      "`/shop`: Browse and buy various items to enhance your fishing experience, like fishing rods and bait.",
    ],
  },
  {
    title: "**🌐 Community & Support**",
    subtitle: "",
    items: [
      "Join the [official Discord server](<<DISCORD_SERVER>>) to get support, share feedback, and stay updated with the latest features and events.",
      "Visit the [website](https://www.mrwhale.io) for more information and documentation.",
      "Check out the [source code](https://github.com/mrwhale-io/mrwhale) on GitHub.",
    ],
  },
];

/**
 * Fetches and returns the bot's information in an embed format.
 *
 * This function gathers various statistics and details about the bot, such as
 * memory usage, uptime, latency, and the number of servers and users. It then
 * formats this information into an embed.
 *
 * @param message The message or command interaction from the Discord API.
 * @param botClient The Discord bot client instance.
 * @returns A promise that resolves to the bot information embed.
 */
export function getBotInfo(
  message: Message | ChatInputCommandInteraction,
  botClient: DiscordBotClient
): EmbedBuilder {
  const avatar = botClient.client.user.displayAvatarURL();
  const memoryUsage = process.memoryUsage().heapUsed / MEM_UNIT / MEM_UNIT;
  const systemUptime = process.uptime() * 1000;
  const botLatency = Date.now() - message.createdTimestamp;

  const description = getBotDescription(
    botClient.client.user.username,
    botClient.discordServer
  );

  const embed = createBotInfoEmbed(
    {
      memoryUsage,
      systemUptime,
      botLatency,
      description,
    },
    botClient
  );

  embed
    .setColor(EMBED_COLOR)
    .setDescription(description)
    .setThumbnail(avatar)
    .setTitle(`About ${botClient.client.user.username}`);

  return embed;
}

/**
 * Generates an embed containing information about the bot when it joins a new guild.
 *
 * @param botClient The instance of the Discord bot client.
 * @returns An EmbedBuilder containing the bot's information.
 */
export function getBotJoinedInfo(botClient: DiscordBotClient): EmbedBuilder {
  const avatar = botClient.client.user.displayAvatarURL();

  const description = getBotDescription(
    botClient.client.user.username,
    botClient.discordServer
  );

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setDescription(description)
    .setThumbnail(avatar)
    .setTitle(`About ${botClient.client.user.username}`);

  return embed;
}

function createBotInfoEmbed(
  { memoryUsage, systemUptime, botLatency }: BotInfo,
  botClient: DiscordBotClient
): EmbedBuilder {
  const totalUsers = botClient.client.guilds.cache.reduce(
    (acc, guild) => acc + guild.memberCount,
    0
  );
  const embed = new EmbedBuilder().addFields([
    {
      name: "🤖 Version",
      value: botClient.version,
      inline: true,
    },
    {
      name: "📊 Servers",
      value: `${botClient.client.guilds.cache.size}`,
      inline: true,
    },
    {
      name: "👥 Users",
      value: `${totalUsers}`,
      inline: true,
    },
    {
      name: "📜 Loaded Commands",
      value: `${botClient.commands.size}`,
      inline: true,
    },
    {
      name: "💾 Memory Usage",
      value: `${memoryUsage.toFixed(FRACTIONAL_DIGITS)} MB`,
      inline: true,
    },
    {
      name: "⏲️ Bot Uptime",
      value: `${TimeUtilities.convertMs(botClient.client.uptime)}`,
      inline: true,
    },
    {
      name: "🖥️ System Uptime",
      value: `${TimeUtilities.convertMs(systemUptime)}`,
      inline: true,
    },
    {
      name: "⚡ Bot Latency",
      value: `${botLatency} ms`,
      inline: true,
    },
    {
      name: "🌐 Discord API Latency",
      value: `${Math.round(botClient.client.ws.ping)} ms`,
      inline: true,
    },
  ]);

  return embed;
}

function getBotDescription(botUsername: string, discordServer: string): string {
  let description = `Hello! I'm **${botUsername}**, your friendly and versatile Discord bot, designed to enhance your server experience with a variety of fun and useful features.\n\n`;
  for (const feature of FEATURES) {
    description += `${feature.title}\n${
      feature.subtitle ? `${feature.subtitle}\n` : ""
    }${feature.items
      .map((item) => `- ${item.replace("<<DISCORD_SERVER>>", discordServer)}\n`)
      .join("")}\n`;
  }

  return description;
}
