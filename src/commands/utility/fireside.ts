import { Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "fireside",
      description: "Joins a fireside.",
      type: "utility",
      usage: "<prefix>fireside <id>",
      cooldown: 3000,
    });
  }

  async action(message: Message, [id]: [string]): Promise<void> {
    try {
      const fireside = await this.client.api.getFireside(id);

      if (fireside) {
        const msg = await message.reply("Joining fireside.");
        this.client.chat.joinRoom(fireside.chat_room_id);

        msg.edit("Joined fireside.");
      }
    } catch {
      message.reply("Could not join fireside.");
    }
  }
}
