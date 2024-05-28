import { TimeUtilities } from "@mrwhale-io/core";
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import { EMBED_COLOR } from "../../constants";

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

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "info",
      description: "Get bot information.",
      type: "utility",
      usage: "<prefix>info",
      aliases: ["uptime", "stats", "version", "about"],
      cooldown: 10000,
    });
  }

  async action(
    message: Message
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    return this.getInfo(message);
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    return this.getInfo(interaction);
  }

  private getInfo(
    message: Message | ChatInputCommandInteraction
  ): Promise<InteractionResponse<boolean>> | Promise<Message<boolean>> {
    const avatar = this.botClient.client.user.displayAvatarURL();
    const memoryUsage = process.memoryUsage().heapUsed / MEM_UNIT / MEM_UNIT;
    const totalUsers = this.botClient.client.guilds.cache.reduce(
      (acc, guild) => acc + guild.memberCount,
      0
    );
    const systemUptime = process.uptime() * 1000;
    const botUptime = this.botClient.client.uptime;
    const botLatency = Date.now() - message.createdTimestamp;
    const apiLatency = Math.round(this.botClient.client.ws.ping);

    let description = `Hello! I'm **${this.botClient.client.user.username}**, your friendly and versatile Discord bot, designed to enhance your server experience with a variety of fun and useful features.\n\n`;

    for (const feature of FEATURES) {
      description += `${feature.title}\n${
        feature.subtitle ? `${feature.subtitle}\n` : ""
      }${feature.items
        .map(
          (item) =>
            `- ${item.replace(
              "<<DISCORD_SERVER>>",
              this.botClient.discordServer
            )}\n`
        )
        .join("")}\n`;
    }

    const embed = new EmbedBuilder()
      .addFields([
        {
          name: "🤖 Version",
          value: this.botClient.version,
          inline: true,
        },
        {
          name: "📊 Servers",
          value: `${this.botClient.client.guilds.cache.size}`,
          inline: true,
        },
        {
          name: "👥 Users",
          value: `${totalUsers}`,
          inline: true,
        },
        {
          name: "📜 Loaded Commands",
          value: `${this.botClient.commands.size}`,
          inline: true,
        },
        {
          name: "💾 Memory Usage",
          value: `${memoryUsage.toFixed(FRACTIONAL_DIGITS)} MB`,
          inline: true,
        },
        {
          name: "⏲️ Bot Uptime",
          value: `${TimeUtilities.convertMs(botUptime)}`,
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
          value: `${apiLatency} ms`,
          inline: true,
        },
      ])
      .setColor(EMBED_COLOR)
      .setDescription(description)
      .setThumbnail(avatar)
      .setTitle(`About ${this.botClient.client.user.username}`);

    return message.reply({ embeds: [embed] });
  }
}
