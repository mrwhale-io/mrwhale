import { Content, Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

const responses = [
  "Oh it has to be <<CHOICE>>",
  "I'd have to go with <<CHOICE>>",
  "It's obviously <<CHOICE>>",
  "It's <<CHOICE>> for sure.",
  "I'd have to say <<CHOICE>>",
  "Definitely <<CHOICE>>",
  "The answer is <<CHOICE>>",
  "My choice is <<CHOICE>>",
  "You're better off with <<CHOICE>>",
  "I have decided it's <<CHOICE>>",
  "I've thought long and hard, however I have decided it's <<CHOICE>>",
  "There's no comparison to <<CHOICE>>",
];

export default class extends Command {
  constructor() {
    super({
      name: "choose",
      description: "Choose between one or multiple choices.",
      "type": "fun",
      usage: "<prefix>choose <choice> or <choice> ...",
    });
  }

  private multiDecide(options: string[]) {
    const selected = options[Math.floor(Math.random() * options.length)];
    if (!selected) {
      return this.multiDecide(options);
    }
    return selected;
  }

  async action(message: Message, [choices]: [string]) {
    const content = new Content();
    if (!choices) {
      content.insertText("No choices have been passed.");
      return message.reply(content);
    }

    const options = choices.split(" or ");

    if (options.length > 1) {
      const index = Math.floor(Math.random() * responses.length);
      const choice = this.multiDecide(options);
      content.insertText(responses[index].replace(/<<CHOICE>>/g, choice));

      return message.reply(content);
    } else {
      content.insertText("Please pass two or more choices.");
      return message.reply(content);
    }
  }
}
