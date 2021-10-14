import { GuessingGame } from "@mrwhale-io/core";
import { Message, Content } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  private games: Map<string, GuessingGame>;

  constructor() {
    super({
      name: "guess",
      description: "Guess the number I'm thinking.",
      usage: "<prefix>guess <quess|hint|end>",
      examples: ["<prefix>guess", "<prefix>guess hint", "<prefix>guess 5"],
      type: "game",
      cooldown: 3000,
    });
    this.games = new Map<string, GuessingGame>();
  }

  private constructAnswer(username: string, answer: string) {
    return new Content().insertText(`@${username} ${answer}`);
  }

  async action(message: Message, [guess]: [string]): Promise<Message> {
    const id = `${message.room_id}:${message.user.id}`;

    if (this.games.has(id)) {
      const game = this.games.get(id);
      if (guess === "hint") {
        return message.reply(
          this.constructAnswer(message.user.username, game.hint())
        );
      }

      if (guess === "end") {
        this.games.delete(id);

        return message.reply(
          this.constructAnswer(message.user.username, "Game ended.")
        );
      }

      const radix = 10;
      const parsedGuess = parseInt(guess, radix);
      if (isNaN(parsedGuess)) {
        return message.reply(
          this.constructAnswer(
            message.user.username,
            "Please pass a number between 1-10"
          )
        );
      }

      if (game.isGameOver) {
        this.games.delete(id);
      }

      return message.reply(
        this.constructAnswer(message.user.username, game.guess(parsedGuess))
      );
    } else {
      this.games.set(id, new GuessingGame());

      return message.reply(
        this.constructAnswer(
          message.user.username,
          `I'm thinking of a number between 1-10. Use guess hint to know how high or low your last number was.`
        )
      );
    }
  }
}
