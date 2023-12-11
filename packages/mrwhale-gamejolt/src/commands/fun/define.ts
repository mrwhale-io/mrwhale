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
    const definitionResult = await define.action(phrase);

    if (typeof definitionResult === "string") {
      return message.reply(definitionResult);
    }

    const firstDefinition = definitionResult[0];
    const content = new Content().insertText(
      truncate(
        MAX_MESSAGE_LENGTH - 3,
        `${firstDefinition.word} - ${definitionResult[0].definition}`
      )
    );

    return message.reply(content);
  }
}
