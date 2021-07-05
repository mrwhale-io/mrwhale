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
    const fireside = await this.client.api.getFireside(id);

    if (fireside) {
      const msg = await message.reply(
        `Attempting to Join the fireside *${fireside.title}*...`
      );
      const push = this.client.chat.joinRoom(fireside.chat_room_id);
      if (push)
        push
          .receive("ok", () => {
            msg.edit(
              `I have successfully joined the fireside **${fireside.title}**. See you there!`
            );
          })
          .receive("error", () => {
            msg.edit(`I could not join *${fireside.title}*`);
          });
    } else {
      message.reply("Invalid fireside.");
    }
  }
}
