import { truncate } from "@mrwhale-io/core";
import { wiki } from "@mrwhale-io/commands";
import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { MAX_MESSAGE_LENGTH } from "../../constants";

export default class extends GameJoltCommand {
  constructor() {
    super(wiki.data);
  }

  async action(message: Message, [query]: [string]): Promise<Message> {
    const wikiPageResult = await wiki.action(query);

    if (typeof wikiPageResult === "string") {
      return message.reply(wikiPageResult);
    }

    const wikiSummary = truncate(
      MAX_MESSAGE_LENGTH - 3,
      wikiPageResult.summary
    );

    return message.reply(wikiSummary);
  }
}
