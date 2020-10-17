import { Content, Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "help",
      description: "Get command help.",
      type: "info",
      usage: "<prefix>help",
    });
  }

  async action(message: Message, [commandName]: [string]) {
    let commands = this.client.commands;
    const content = new Content();

    if (commandName) {
      const cmd = this.client.commands.find(
        (c: Command) => c.name === commandName
      );

      if (cmd) {
        content.insertCodeBlock(
          `Name: ${cmd.name}\nDescription: ${cmd.description}\nType: ${
            cmd.type
          }\nUsage: ${cmd.usage.replace(/<prefix>/g, this.client.prefix)}`
        );

        return message.reply(content);
      }

      return message.reply("Could not find this command");
    }

    let listItemNodes = [];
    for (let cmd of commands) {
      const contentText = content.textNode(`${cmd.name} - ${cmd.description}`);
      const contentNode = content.paragraphNode(contentText);

      listItemNodes.push(content.listItemNode(contentNode));
    }

    content.insertBulletList(listItemNodes);

    return message.reply(content);
  }
}
