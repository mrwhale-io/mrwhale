import { purifyText } from "@mrwhale-io/core";
import { ascii } from "@mrwhale-io/commands";
import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super(ascii.data);
  }

  async action(message: Message, [text]: [string]): Promise<Message> {
    if (!text) {
      return message.reply("Please provide some text.");
    }

    const purifiedText = purifyText(text);
    const asciiResult = await ascii.action(purifiedText);

    return message.reply(`${asciiResult}`);
  }
}
