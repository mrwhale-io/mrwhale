import {
  ChatInputCommandInteraction,
  Message,
  AttachmentBuilder,
} from "discord.js";

import { getLevelFromExp, getRemainingExp, levelToExp } from "@mrwhale-io/core";
import { DiscordCommand } from "../../client/command/discord-command";
import { LevelManager } from "../../client/managers/level-manager";
import { PlayerInfo } from "../../types/player-info";
import { CardTheme } from "../../types/card-theme";
import { createPlayerCard } from "../../image/create-player-card";

const THEME: CardTheme = {
  fillColor: "#001625",
  primaryTextColor: "#ffffff",
  secondaryTextColor: "#88f9ba",
  progressFillColor: "#002b3d",
  progressColor: "#71b8ce",
  font: "28px sans-serif",
};

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "rank",
      description: "Get your current rank in the guild.",
      usage: "<prefix>rank",
      type: "level",
      cooldown: 3000,
      guildOnly: true,
      clientPermissions: ["AttachFiles"],
    });
    this.slashCommandData.addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to fetch rank for.")
        .setRequired(false)
    );
  }

  async action(message: Message): Promise<void | Message> {
    try {
      const user = message.mentions.users.first() || message.author;
      const responseMsg = await message.reply("Processing please wait...");
      const score = await LevelManager.getUserScore(message.guildId, user.id);
      const scores = await LevelManager.getScores(message.guildId);
      const playerSorted = scores.sort((a, b) => a.exp - b.exp).reverse();
      if (!score) {
        return message.reply(
          user.id === message.author.id
            ? "You aren't ranked yet. Send some messages first, then try again."
            : "This user is not ranked."
        );
      }

      const level = getLevelFromExp(score.exp);
      const rank = playerSorted.findIndex((p) => p.userId === user.id) + 1;
      const info: PlayerInfo = {
        user,
        totalExp: score.exp,
        levelExp: levelToExp(level),
        remainingExp: getRemainingExp(score.exp),
        level,
        rank,
      };
      const canvas = await createPlayerCard(info, THEME);
      const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
        name: "rank-image.png",
      });

      responseMsg.edit({ files: [attachment], content: null });
    } catch {
      return message.reply(`An error occured while fetching rank.`);
    }
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<unknown> {
    try {
      await interaction.deferReply();
      const user = interaction.options.getUser("user") || interaction.user;
      const score = await LevelManager.getUserScore(
        interaction.guildId,
        user.id
      );
      const scores = await LevelManager.getScores(interaction.guildId);
      const playerSorted = scores.sort((a, b) => a.exp - b.exp).reverse();
      if (!score) {
        return interaction.editReply(
          user.id === interaction.user.id
            ? "You aren't ranked yet. Send some messages first, then try again."
            : "This user is not ranked."
        );
      }

      const level = getLevelFromExp(score.exp);
      const rank = playerSorted.findIndex((p) => p.userId === user.id) + 1;
      const info: PlayerInfo = {
        user,
        totalExp: score.exp,
        levelExp: levelToExp(level),
        remainingExp: getRemainingExp(score.exp),
        level,
        rank,
      };
      const canvas = await createPlayerCard(info, THEME);
      const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
        name: "rank-image.png",
      });

      interaction.editReply({ files: [attachment] });
    } catch {
      return interaction.editReply(`An error occured while fetching rank.`);
    }
  }
}
