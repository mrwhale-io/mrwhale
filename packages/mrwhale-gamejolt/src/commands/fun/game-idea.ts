import { gameIdea } from "@mrwhale-io/commands";
import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      ...gameIdea.data,
      usage: "<prefix>gameidea [simple|detailed]",
      description: "Generate a random game idea with intelligent combinations.",
    });
  }

  async action(message: Message, args: string[]): Promise<Message> {
    const formattedIdea = gameIdea.action(args);

    return message.reply(formattedIdea);
  }
}
