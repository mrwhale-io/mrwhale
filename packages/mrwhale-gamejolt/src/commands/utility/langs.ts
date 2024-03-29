import * as translate from "translate-google";

import { Message } from "@mrwhale-io/gamejolt-client";
import { unorderedList } from "@mrwhale-io/core";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "langs",
      description: "List supported languages for the translate command.",
      type: "utility",
      usage: "<prefix>langs",
      cooldown: 5000,
    });
  }

  async action(message: Message): Promise<Message> {
    const languages = [];

    for (const language in translate.languages) {
      languages.push(language);

      if (language === "zu") {
        break;
      }
    }

    return message.reply(unorderedList(languages));
  }
}
