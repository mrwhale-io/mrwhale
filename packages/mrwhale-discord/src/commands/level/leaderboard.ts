import { CommandInteraction, Message, MessageEmbed, User } from "discord.js";
import * as sequelize from "sequelize";

import { code, getLevelFromExp } from "@mrwhale-io/core";
import { DiscordCommand } from "../../client/command/discord-command";
import { Score } from "../../database/models/score";
import { EMBED_COLOR } from "../../constants";

interface MappedScores {
  exp: number;
  user: User;
  level: number;
}

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "leaderboard",
      description: "List the top players in the server.",
      type: "level",
      usage: "<prefix>leaderboard",
      examples: ["<prefix>leaderboard"],
      guildOnly: true,
      cooldown: 3000,
    });
    this.slashCommandData.addBooleanOption((option) =>
      option
        .setName("global")
        .setDescription("Fetch the global leaderboard.")
        .setRequired(false)
    );
  }

  private async createTable(mappedScores: MappedScores[]): Promise<string> {
    mappedScores = mappedScores.sort((a, b) => b.exp - a.exp);

    let table = "Here are the top players for this leaderboard.\n\n";
    for (let i = 0; i < mappedScores.length; i++) {
      const score = mappedScores[i];
      table += `${code(`#${i + 1}`)} | <@${score.user.id}> • *Exp: ${
        score.exp
      } (Level ${score.level})*\n\n`;
    }

    return table.toString();
  }

  private async getGuildScores(message: Message | CommandInteraction) {
    const scores = await Score.findAll({
      where: {
        guildId: message.guildId,
      },
      order: [["exp", "DESC"]],
      limit: 10,
    });

    let mappedScores: MappedScores[] = [];
    for (let score of scores) {
      mappedScores.push({
        exp: score.exp,
        user: message.client.users.cache.has(score.userId)
          ? message.client.users.cache.get(score.userId)
          : await message.client.users.fetch(score.userId),
        level: getLevelFromExp(score.exp),
      });
    }

    return mappedScores;
  }

  private async getGlobalScores(
    message: Message | CommandInteraction
  ): Promise<MappedScores[]> {
    const sum: any = sequelize.fn("sum", sequelize.col("exp"));
    const scores = await Score.findAll({
      attributes: ["userId", [sum, "total"]],
      group: ["Score.userId"],
      limit: 10,
    });
    let mappedScores: MappedScores[] = [];
    for (let score of scores) {
      mappedScores.push({
        exp: score.getDataValue("total"),
        user: message.client.users.cache.has(score.userId)
          ? message.client.users.cache.get(score.userId)
          : await message.client.users.fetch(score.userId),
        level: getLevelFromExp(score.getDataValue("total")),
      });
    }

    return mappedScores;
  }

  async action(message: Message, [command]: [string]): Promise<Message> {
    try {
      const embed = new MessageEmbed().setColor(EMBED_COLOR);

      let mappedScores: MappedScores[] = [];
      if (command && command.toLowerCase().trim() === "global") {
        embed.setTitle(`Global leaderboard`);
        mappedScores = await this.getGlobalScores(message);

        if (mappedScores.length < 1) {
          return message.reply("No one is ranked.");
        }
      } else {
        embed.setTitle(`${message.guild.name} leaderboard`);
        mappedScores = await this.getGuildScores(message);

        if (mappedScores.length < 1) {
          return message.reply("No one is ranked in this server.");
        }
      }

      const table = await this.createTable(mappedScores);
      embed.setDescription(table);

      return message.reply({
        embeds: [embed],
        allowedMentions: { users: [] },
      });
    } catch {
      return message.reply("Could not fetch leaderboard.");
    }
  }

  async slashCommandAction(interaction: CommandInteraction): Promise<void> {
    try {
      let mappedScores: MappedScores[] = [];

      const global = interaction.options.getBoolean("global") || false;
      const embed = new MessageEmbed().setColor(EMBED_COLOR);

      if (global) {
        embed.setTitle(`Global leaderboard`);
        mappedScores = await this.getGlobalScores(interaction);

        if (mappedScores.length < 1) {
          return interaction.reply("No one is ranked.");
        }
      } else {
        embed.setTitle(`${interaction.guild.name} leaderboard`);
        mappedScores = await this.getGuildScores(interaction);
        if (mappedScores.length < 1) {
          return interaction.reply("No one is ranked in this server.");
        }
      }

      const table = await this.createTable(mappedScores);
      embed.setDescription(table);

      return interaction.reply({
        embeds: [embed],
        allowedMentions: { users: [] },
      });
    } catch {
      return interaction.reply("Could not fetch leaderboard.");
    }
  }
}
