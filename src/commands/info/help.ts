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
        const contentText = content.state.schema.text(
          `Name: ${cmd.name}\nDescription: ${cmd.description}\nType: ${
            cmd.type
          }\nUsage: ${cmd.usage.replace(/<prefix>/g, this.client.prefix)}`
        );
        const node = content.schema.nodes.codeBlock.create({}, [contentText]);
        content.insertNewNode(node);

        return message.reply(content);
      }

      return message.reply("Could not find this command");
    }

    let listItemNodes = [];
    for (let cmd of commands) {
      const contentText = content.state.schema.text(
        `${cmd.name} - ${cmd.description}`
      );
      const contentNode = content.state.schema.nodes.paragraph.create({}, [
        contentText,
      ]);

      listItemNodes.push(
        content.state.schema.nodes.listItem.create({}, [contentNode])
      );
    }

    const listNode = content.state.schema.nodes.bulletList.create(
      {},
      listItemNodes
    );
    content.insertNewNode(listNode);

    return message.reply(content);
  }
}
