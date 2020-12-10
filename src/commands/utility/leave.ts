import { Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "leave",
      description: "Make me leave the group chat.",
      type: "utility",
      usage: "<prefix>leave",
      groupOnly: true,
    });
  }

  async action(message: Message): Promise<void> {
    const room = this.client.chat.activeRooms[message.room_id];

    if (room && message.user.id === room.owner_id) {
      message.reply("Goodbye 👋");
      this.client.chat.userChannel?.push("group_leave", { room_id: room.id });
    } else {
      message.reply("You need to be room owner to use this command.");
    }
  }
}
