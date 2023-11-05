import * as sequelize from "sequelize";
import * as AsciiTable from "ascii-table";
import { User as GameUser } from "joltite.js";

import { getLevelFromExp, codeBlock } from "@mrwhale-io/core";
import { Message, User } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { Score } from "../../database/models/score";

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

export default class extends GameJoltCommand {
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

  private createTable(name: string, mappedScores: MappedScores[]) {
    const table = new AsciiTable(name);
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
    const scores = await Score.findAll({
      where: {
        roomId,
      },
      order: [["exp", "DESC"]],
      limit: 10,
    });

    const room = this.botClient.chat.activeRooms[roomId];
    const mappedMembers = mapUsers(room.members);
    const filteredScores = scores.filter(({ userId }) =>
      Object.keys(mappedMembers).includes(userId.toString())
    );

    const mappedScores: MappedScores[] = filteredScores.map((score) => ({
      exp: score.exp,
      user: mappedMembers[score.userId],
      level: getLevelFromExp(score.exp),
    }));

    return mappedScores;
  }

  private async getGlobalScores() {
    const sum: any = sequelize.fn("sum", sequelize.col("exp"));
    const scores = await Score.findAll({
      attributes: ["userId", [sum, "total"]],
      group: ["Score.userId"],
      order: [[sum, "DESC"]],
      limit: 10,
    });

    const memberIds = scores.map((score) => score.userId);
    const members = await this.botClient.gameApi.users.fetch(memberIds);
    const mappedMembers = mapUsers(members.users);

    const mappedScores: MappedScores[] = scores.map((score) => ({
      exp: score.getDataValue("total"),
      user: mappedMembers[score.userId],
      level: getLevelFromExp(score.getDataValue("total")),
    }));

    return mappedScores;
  }

  async action(message: Message, [command]: [string]): Promise<Message> {
    try {
      let mappedScores: MappedScores[] = [];
      let name = "LEADERBOARD";
      if (command && command.toLowerCase().trim() === "global") {
        mappedScores = await this.getGlobalScores();
        name = "GLOBAL LEADERBOARD";

        if (mappedScores.length < 1) {
          return message.reply("No one is ranked.");
        }
      } else {
        mappedScores = await this.getRoomScores(message.room_id);

        if (mappedScores.length < 1) {
          return message.reply("No one is ranked in this room.");
        }
      }

      const table = this.createTable(name, mappedScores);

      return message.reply(codeBlock(table.toString()));
    } catch {
      return message.reply("Could not fetch leaderboard.");
    }
  }
}
