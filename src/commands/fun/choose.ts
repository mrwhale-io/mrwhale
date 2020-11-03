import { Message } from "@mrwhale-io/gamejolt";

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
      type: "fun",
      usage: "<prefix>choose <choice> or <choice> ...",
    });
  }

  private multiDecide(options: string[]): string {
    const selected = options[Math.floor(Math.random() * options.length)];
    if (!selected) {
      return this.multiDecide(options);
    }
    return selected;
  }

  async action(message: Message, args: string[]) {
    const choices = args.join();
    if (!choices) {
      return message.reply("No choices have been passed.");
    }

    const separators = ["or", ","];
    const options = choices.split(new RegExp(separators.join("|"), "gi"));

    if (options.length > 1) {
      const index = Math.floor(Math.random() * responses.length);
      const choice = this.multiDecide(options).trim();

      return message.reply(responses[index].replace(/<<CHOICE>>/g, choice));
    } else {
      return message.reply("Please pass two or more choices.");
    }
  }
}
