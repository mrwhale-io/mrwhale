import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "say",
      description: "Make me say something.",
      type: "admin",
      usage: "<prefix>say <phrase>",
      admin: true,
    });
  }

  async action(message: Message, [phrase]: [string]): Promise<Message> {
    if (!phrase) {
      return message.reply("Please pass a phrase for me to say.");
    }
    return message.reply(phrase);
  }
}
