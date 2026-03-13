import * as sequelize from "sequelize";
import * as AsciiTable from "ascii-table";
import { User as GameUser } from "joltite.js";

import {
  getLevelFromExp,
  codeBlock,
  levelToExp,
  getRemainingExp,
  truncate,
} from "@mrwhale-io/core";
import { Message, User } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { Score } from "../../database/models/score";

/**
 * Represents a mapped score for a user.
 */
interface MappedScores {
  /** The experience points of the user. */
  exp: number;
  /** The user object. */
  user: User | GameUser;
  /** The level of the user. */
  level: number;
  /** The rank of the user. */
  rank: number;
}

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "leaderboard",
      description: "List the top players in the room.",
      type: "level",
      usage: "<prefix>leaderboard [global]",
      examples: ["<prefix>leaderboard", "<prefix>leaderboard global"],
      groupOnly: true,
      cooldown: 3000,
    });
  }

  async action(message: Message, [command]: [string]): Promise<Message> {
    try {
      let mappedScores: MappedScores[] = [];
      let name = "🏆 ROOM LEADERBOARD";
      let isGlobal = false;

      if (command && command.toLowerCase().trim() === "global") {
        mappedScores = await this.getGlobalScores();
        name = "🌍 GLOBAL LEADERBOARD";
        isGlobal = true;

        if (mappedScores.length < 1) {
          return message.reply("📊 No global rankings available yet.");
        }
      } else {
        mappedScores = await this.getRoomScores(message.room_id);

        if (mappedScores.length < 1) {
          return message.reply(
            "📊 No one is ranked in this room yet. Start chatting to gain experience!",
          );
        }
      }

      const table = this.createTable(name, mappedScores);
      let response = codeBlock(table.toString());

      // Add user's own rank if not in top 5
      const userRankInfo = await this.getUserRankInfo(
        message.user.id,
        message.room_id,
        isGlobal,
      );
      if (userRankInfo) {
        response += `\n\n${userRankInfo}`;
      }

      return message.reply(response);
    } catch (error) {
      this.botClient.logger.error(`Error fetching leaderboard: ${error}`);
      return message.reply(
        "❌ Could not fetch leaderboard. Please try again later.",
      );
    }
  }

  /**
   * Creates a map of member IDs to member objects.
   * @param members The list of members to map.
   * @returns A map where the key is the member ID and the value is the member object.
   */
  private createMemberMap(
    members: readonly User[] | GameUser[],
  ): Map<number, User | GameUser> {
    return new Map(
      members.map(
        (member: User | GameUser): readonly [number, User | GameUser] => [
          Number(member.id),
          member,
        ],
      ),
    );
  }

  /**
   * Gets the rank information for a user.
   * @param userId The ID of the user.
   * @param roomId The ID of the room.
   * @param isGlobal Whether to fetch global rank or room rank.
   * @returns A string with the user's rank information or null if not found.
   */
  private async getUserRankInfo(
    userId: number,
    roomId: number,
    isGlobal: boolean,
  ): Promise<string | null> {
    try {
      let userRank: number;
      let userExp: number;

      if (isGlobal) {
        // Get user's global rank
        const sum = sequelize.fn("sum", sequelize.col("exp"));
        const allScores = await Score.findAll({
          attributes: ["userId", [sum, "total"]],
          group: ["Score.userId"],
          order: [[sum, "DESC"]],
        });

        const userIndex = allScores.findIndex(
          (score) => score.userId === userId,
        );
        if (userIndex === -1) return null;

        userRank = userIndex + 1;
        userExp = allScores[userIndex].getDataValue("total") as number;
      } else {
        // Get user's room rank
        const roomScores = await Score.findAll({
          where: { roomId },
          order: [["exp", "DESC"]],
        });

        const userIndex = roomScores.findIndex(
          (score) => score.userId === userId,
        );
        if (userIndex === -1) return null;

        userRank = userIndex + 1;
        userExp = roomScores[userIndex].exp;
      }

      // Only show if user is not in top 5
      if (userRank <= 5) return null;

      const userLevel = getLevelFromExp(userExp);
      return `📍 **Your Position:** Rank #${userRank} | Level ${userLevel} | ${userExp.toLocaleString()} EXP`;
    } catch (error) {
      this.botClient.logger.error(`Error getting user rank: ${error}`);
      return null;
    }
  }

  /**
   * Creates a table for the leaderboard.
   * @param name The name of the leaderboard.
   * @param mappedScores The scores to display in the table.
   * @returns An AsciiTable instance with the leaderboard data.
   */
  private createTable(name: string, mappedScores: MappedScores[]) {
    const table = new AsciiTable(name);
    table.setHeading("Rank", "Player", "Exp", "Level", "Progress");

    for (let i = 0; i < mappedScores.length; i++) {
      const score = mappedScores[i];
      const rankIcon = this.getRankIcon(i + 1);
      const levelProgress = this.getLevelProgress(score.exp, score.level);

      table.addRow(
        `${rankIcon}${i + 1}`,
        truncate(20, score.user.username),
        score.exp.toLocaleString(),
        `Lv.${score.level}`,
        levelProgress,
      );
    }

    return table;
  }

  /**
   * Gets the icon for a given rank.
   * @param rank The rank of the user.
   * @returns A string representing the rank icon.
   */
  private getRankIcon(rank: number): string {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "";
    }
  }

  /**
   * Gets the progress bar for a user's level.
   * @param exp The user's experience points.
   * @param level The user's current level.
   * @returns A string representing the user's level progress.
   */
  private getLevelProgress(exp: number, level: number): string {
    const levelExp = levelToExp(level);
    const remainingExp = getRemainingExp(exp);
    const percentage = Math.min(
      Math.round((remainingExp / levelExp) * 100),
      100,
    );

    // Create a simple progress bar
    const filledBlocks = Math.floor(percentage / 10);
    const emptyBlocks = 10 - filledBlocks;
    const progressBar = "■".repeat(filledBlocks) + "□".repeat(emptyBlocks);

    return `${progressBar} ${percentage}%`;
  }

  /**
   * Gets the top scores for a specific room.
   * @param roomId The ID of the room.
   * @returns A promise that resolves to an array of mapped scores for the room.
   */
  private async getRoomScores(roomId: number): Promise<MappedScores[]> {
    const scores = await Score.findAll({
      where: {
        roomId,
      },
      order: [["exp", "DESC"]],
      limit: 5,
    });

    const room = this.botClient.chat.activeRooms.get(roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    const mappedMembers = this.createMemberMap(room.members);
    const filteredScores = scores.filter(({ userId }) =>
      mappedMembers.has(userId),
    );

    const mappedScores: MappedScores[] = filteredScores.map((score, index) => ({
      exp: score.exp,
      user: mappedMembers.get(score.userId)!,
      level: getLevelFromExp(score.exp),
      rank: index + 1,
    }));

    return mappedScores;
  }

  /**
   * Gets the top global scores.
   * @returns A promise that resolves to an array of mapped scores for the global leaderboard.
   */
  private async getGlobalScores(): Promise<MappedScores[]> {
    const sum = sequelize.fn("sum", sequelize.col("exp"));
    const scores = await Score.findAll({
      attributes: ["userId", [sum, "total"]],
      group: ["Score.userId"],
      order: [[sum, "DESC"]],
      limit: 5,
    });

    const memberIds = scores.map((score) => score.userId);
    const members = await this.botClient.gameApi.users.fetch(memberIds);
    const mappedMembers = this.createMemberMap(members.users);
    const mappedScores: MappedScores[] = scores.map((score, index) => {
      const totalExp = score.getDataValue("total") as number;
      return {
        exp: totalExp,
        user: mappedMembers.get(score.userId)!,
        level: getLevelFromExp(totalExp),
        rank: index + 1,
      };
    });

    return mappedScores;
  }
}
