import { Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";
import { eyes } from "../../data/eyes";

export default class extends Command {
  constructor() {
    super({
      name: "whale",
      description: "Generate a whale face.",
      type: "fun",
      usage: "<prefix>whale <length>",
    });
  }

  async action(message: Message, [size]: [string]) {
    const min = 5;
    const max = 50;

    let whaleSize = 5;

    if (size) {
      const radix = 10;
      whaleSize = parseInt(size, radix);
    }

    whaleSize = Math.min(Math.max(whaleSize, min), max);

    let whale = "";
    const whaleEyes = eyes[Math.floor(Math.random() * eyes.length)];

    whale += whaleEyes[0];
    for (let i = 0; i < whaleSize; i++) {
      whale += "_";
    }
    whale += whaleEyes[1];

    return message.reply(whale);
  }
}
