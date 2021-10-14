import { Message, RoomType } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "leave",
      description: "Make me leave the group chat.",
      type: "utility",
      usage: "<prefix>leave",
      groupOnly: true,
      owner: true,
    });
  }

  async action(message: Message): Promise<void> {
    const room = this.botClient.client.chat.activeRooms[message.room_id];
    const leaveResponses = [
      `Alright I'm leaving 👋`,
      `Bye Bye 👋`,
      `Aww but I was having so much fun... Well cya then.. 😢`,
      `Okay okay I'll leave! Sheesh!`,
    ];
    const index = Math.floor(Math.random() * leaveResponses.length);

    message.reply(leaveResponses[index]);

    if (room?.type === RoomType.ClosedGroup) {
      this.botClient.client.chat.userChannel?.push("group_leave", {
        room_id: room.id,
      });
    } else if (room?.type === RoomType.FiresideGroup) {
      this.botClient.client.chat.leaveRoom(room.id);
    }
  }
}
