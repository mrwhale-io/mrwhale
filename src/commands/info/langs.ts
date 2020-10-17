import * as translate from "translate-google";
import { Content, Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "langs",
      description: "List supported languages for the translate command.",
      type: "info",
      usage: "<prefix>langs",
    });
  }

  async action(message: Message) {
    const content = new Content();
    let listItemNodes = [];
    const languages = translate.languages;

    for (let language in languages) {
      const contentText = content.state.schema.text(language);
      const contentNode = content.state.schema.nodes.paragraph.create({}, [
        contentText,
      ]);

      listItemNodes.push(
        content.state.schema.nodes.listItem.create({}, [contentNode])
      );

      if (language === "zu") {
        break;
      }
    }

    const listNode = content.state.schema.nodes.bulletList.create(
      {},
      listItemNodes
    );
    content.insertNewNode(listNode);

    return message.reply(content);
  }
}
