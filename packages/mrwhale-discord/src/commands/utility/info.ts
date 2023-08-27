import { TimeUtilities } from "@mrwhale-io/core";
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import { version } from "../../../package.json";
import { discordServer } from "../../../config.json";
import { EMBED_COLOR } from "../../constants";

const FRACTIONAL_DIGITS = 2;
const MEM_UNIT = 1024;

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "info",
      description: "Get bot information.",
      type: "utility",
      usage: "<prefix>info",
      aliases: ["uptime", "stats", "version", "about"],
      cooldown: 3000,
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

    const embed = new EmbedBuilder()
      .addFields([
        {
          name: "Official Discord server",
          value: `[Join my Discord server!](${discordServer})`,
        },
        {
          name: "Source code",
          value: "https://github.com/mrwhale-io/mrwhale",
        },
        {
          name: "Version",
          value: version,
        },
        {
          name: "Server",
          value: `${this.botClient.client.guilds.cache.size}`,
        },
        {
          name: "Loaded commands",
          value: `${this.botClient.commands.size}`,
        },
        {
          name: "Memory usage",
          value: `${memoryUsage.toFixed(FRACTIONAL_DIGITS)} MB`,
        },
        {
          name: "Bot uptime",
          value: `${TimeUtilities.convertMs(this.botClient.client.uptime)}`,
        },
      ])
      .setColor(EMBED_COLOR)
      .setDescription(
        `Hi I'm ${this.botClient.client.user.username} a general purpose discord bot. Use the \`help\` command to see my commands`
      )
      .setThumbnail(avatar)
      .setTitle(`About ${this.botClient.client.user.username}`);

    return message.reply({ embeds: [embed] });
  }
}
