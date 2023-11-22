import { rockpaper } from "@mrwhale-io/commands";
import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super(rockpaper.data);
  }

  async action(message: Message, [choice]: [string]): Promise<Message> {
    return message.reply(rockpaper.action(choice));
  }
}
