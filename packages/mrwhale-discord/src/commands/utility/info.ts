import { TimeUtilities } from "@mrwhale-io/core";
import { CommandInteraction, MessageEmbed } from "discord.js";

import { DiscordCommand } from "../../client/discord-command";
import { version } from "../../../package.json";
import { discordServer } from "../../../config.json";

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

  async action(interaction: CommandInteraction): Promise<void> {
    const avatar = this.botClient.client.user.displayAvatarURL();
    const memoryUsage = process.memoryUsage().heapUsed / MEM_UNIT / MEM_UNIT;

    const embed = new MessageEmbed()
      .addField(
        "Official Discord server",
        `[Join my Discord server!](${discordServer})`
      )
      .addField("Source code", "https://github.com/mrwhale-io/mrwhale")
      .addField("Version", version)
      .addField("Server", `${this.botClient.client.guilds.cache.size}`)
      .addField("Loaded commands", `${this.botClient.commands.size}`)
      .addField("Memory usage", `${memoryUsage.toFixed(FRACTIONAL_DIGITS)} MB`)
      .addField(
        "Bot uptime",
        `${TimeUtilities.convertMs(this.botClient.client.uptime)}`
      )
      .setColor("#71b8ce")
      .setDescription(
        `Hi I'm ${this.botClient.client.user.username} a general purpose discord bot. Use the \`help\` command to see my commands`
      )
      .setThumbnail(avatar)
      .setTitle(`About ${this.botClient.client.user.username}`);

    return interaction.reply({ embeds: [embed] });
  }
}
