import { gameIdea } from "@mrwhale-io/commands";
import { InfoBuilder } from "@mrwhale-io/core";
import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super(gameIdea.data);
  }

  async action(message: Message): Promise<Message> {
    const game = gameIdea.action();
    const info = new InfoBuilder()
      .addField("Genre", game.genre)
      .addField("Location", game.environment)
      .addField("Objective", `${game.goal} ${game.item}`)
      .addField("Rules/Mechanics", game.rule)
      .build();

    return message.reply(info);
  }
}
