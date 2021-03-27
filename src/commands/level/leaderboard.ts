import { Message, User } from "@mrwhale-io/gamejolt";
import * as AsciiTable from "ascii-table";
import { User as GameUser } from "joltite.js";

import { Command } from "../command";
import { Score } from "../../database/entity/score";
import { Database } from "../../database/database";
import { codeBlock } from "../../util/markdown-helpers";
import { LevelManager } from "../../managers/level-manager";
import { createQueryBuilder } from "typeorm";

interface MappedScores {
  exp: number;
  user: User | GameUser;
  level: number;
}

function mapUsers(members: User[] | GameUser[]) {
  const mappedMembers = {};
  for (const member of members) {
    mappedMembers[member.id] = member;
  }

  return mappedMembers;
}

export default class extends Command {
  constructor() {
    super({
      name: "leaderboard",
      description: "List the top players in the room.",
      type: "level",
      usage: "<prefix>leaderboard",
      examples: ["<prefix>leaderboard"],
      groupOnly: true,
      cooldown: 3000,
    });
  }

  private createTable(mappedScores: MappedScores[]) {
    const table = new AsciiTable("LEADERBOARD");
    table.setHeading("#", "Member", "Experience", "Level");

    for (let i = 0; i < mappedScores.length; i++) {
      table.addRow(
        i + 1,
        mappedScores[i].user.username,
        mappedScores[i].exp,
        mappedScores[i].level
      );
    }

    return table;
  }

  private async getRoomScores(roomId: number) {
    const scores: Score[] = await Database.connection
      .getRepository(Score)
      .find({
        where: {
          roomId,
        },
        order: {
          exp: "DESC",
        },
        skip: 0,
        take: 10,
      });

    const room = this.client.chat.activeRooms[roomId];
    const mappedMembers = mapUsers(room.members);

    const filteredScores = scores.filter(({ userId }) =>
      Object.keys(mappedMembers).includes(userId.toString())
    );

    const mappedScores: MappedScores[] = filteredScores.map((score) => ({
      exp: score.exp,
      user: mappedMembers[score.userId],
      level: LevelManager.getLevelFromExp(score.exp),
    }));

    return mappedScores;
  }

  private async getGlobalScores() {
    const scores: Score[] = await createQueryBuilder("score")
      .select("score.userId, SUM(score.exp)", "exp")
      .orderBy("exp", "DESC")
      .groupBy("score.userId")
      .skip(0)
      .take(10)
      .execute();
    const memberIds = scores.map((score) => score.userId);
    const members = await this.client.gameApi.users.fetch(memberIds);
    const mappedMembers = mapUsers(members.users);

    const mappedScores: MappedScores[] = scores.map((score) => ({
      exp: score.exp,
      user: mappedMembers[score.userId],
      level: LevelManager.getLevelFromExp(score.exp),
    }));

    return mappedScores;
  }

  async action(message: Message, [command]: [string]): Promise<Message> {
    try {
      let mappedScores: MappedScores[] = [];
      if (command && command.toLowerCase().trim() === "global") {
        mappedScores = await this.getGlobalScores();

        if (mappedScores.length < 1) {
          return message.reply("No one is ranked.");
        }
      } else {
        mappedScores = await this.getRoomScores(message.room_id);

        if (mappedScores.length < 1) {
          return message.reply("No one is ranked in this room.");
        }
      }

      const table = this.createTable(mappedScores);

      return message.reply(codeBlock(table.toString()));
    } catch {
      return message.reply("Could not fetch leaderboard.");
    }
  }
}
