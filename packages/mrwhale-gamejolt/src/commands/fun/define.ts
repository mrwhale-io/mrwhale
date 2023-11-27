import { define } from "@mrwhale-io/commands";
import { truncate } from "@mrwhale-io/core";
import { Content, Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { MAX_MESSAGE_LENGTH } from "../../constants";

export default class extends GameJoltCommand {
  constructor() {
    super(define.data);
  }

  async action(message: Message, [phrase]: [string]): Promise<Message> {
    const definition = await define.action(phrase);
    const content = new Content().insertText(
      truncate(MAX_MESSAGE_LENGTH - 3, definition)
    );
  
    return message.reply(content);
  }
}
