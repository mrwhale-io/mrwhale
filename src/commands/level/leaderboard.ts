import { Message, User } from "@mrwhale-io/gamejolt";
import * as AsciiTable from "ascii-table";

import { Command } from "../command";
import { Score } from "../../database/entity/score";
import { Database } from "../../database/database";
import { codeBlock } from "../../util/markdown-helpers";
import { LevelManager } from "../../managers/level-manager";

interface MappedScores {
  exp: number;
  user: User;
  level: number;
}

export default class extends Command {
  constructor() {
    super({
      name: "leaderboard",
      description: "List the top players in the room.",
      type: "level",
      usage: "<prefix>leaderboard <text>",
      examples: ["<prefix>leaderboard"],
      groupOnly: true,
      cooldown: 5000,
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

  private getMappedScores(scores: Score[], roomId: number) {
    const room = this.client.chat.activeRooms[roomId];
    const mappedMembers = {};
    for (const member of room.members) {
      mappedMembers[member.id] = member;
    }

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

  async action(message: Message): Promise<Message> {
    try {
      const scores: Score[] = await Database.connection
        .getRepository(Score)
        .find({
          where: {
            roomId: message.room_id,
          },
          order: {
            exp: "DESC",
          },
        });
      const mappedScores = this.getMappedScores(scores, message.room_id);
      const table = this.createTable(mappedScores);

      return message.reply(codeBlock(table.toString()));
    } catch {
      return message.reply("Could not fetch leaderboard.");
    }
  }
}
