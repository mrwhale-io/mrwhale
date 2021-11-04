import { translate } from "@mrwhale-io/commands";
import { truncate } from "@mrwhale-io/core";
import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super(translate.data);
  }

  async action(
    message: Message,
    [lang, ...text]: [string, string[]]
  ): Promise<Message> {
    const toTranslate = text.join();

    if (!toTranslate) {
      return message.reply("Please pass some text to translate.");
    }

    const translated = await translate.action(toTranslate, lang);

    return message.reply(truncate(980, translated));
  }
}
