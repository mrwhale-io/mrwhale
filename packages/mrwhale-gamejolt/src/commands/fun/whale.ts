import { whale } from "@mrwhale-io/commands";
import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super(whale.data);
  }

  async action(message: Message, [size]: [string]): Promise<Message> {
    let whaleSize = 5;

    if (size) {
      const radix = 10;
      const parsedSize = parseInt(size, radix);

      if (!isNaN(parsedSize)) {
        whaleSize = parsedSize;
      }
    }

    return message.reply(whale.action(whaleSize));
  }
}
