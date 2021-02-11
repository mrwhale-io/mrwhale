import { Message } from "@mrwhale-io/gamejolt";

import { HangmanGame } from "../../types/hangman-game";
import { Command } from "../command";
import { TimeUtilities } from "../../util/time";

export default class extends Command {
  constructor() {
    super({
      name: "hangman",
      description: "Play a classic game of hangman.",
      usage: "<prefix>hangman <start|guess|end>",
      examples: [
        "<prefix>hangman start",
        "<prefix>hangman guess a",
        "<prefix>hangman end",
      ],
      type: "game",
      argSeparator: " ",
      cooldown: 3000,
    });
    this.games = new Map<number, HangmanGame>();
  }

  private games: Map<number, HangmanGame>;

  async action(
    message: Message,
    [commandName, input]: [string, string]
  ): Promise<Message> {
    if (!commandName) {
      return message.reply(
        "Please provide a command. Use !help hangman for more info."
      );
    }

    if (this.games.has(message.room_id)) {
      if (
        this.games.get(message.room_id).won ||
        this.games.get(message.room_id).isGameOver
      ) {
        this.games.delete(message.room_id);
      }
    }

    commandName = commandName.trim().toLowerCase();

    if (input) {
      input = input.trim().toLowerCase();
    }

    // Create a new hangman game
    if (commandName === "start") {
      if (this.games.has(message.room_id)) {
        return message.reply("There is already an active game for this room.");
      } else {
        const newGame = new HangmanGame(message.user.id);
        const started = newGame.start();

        if (started) {
          this.games.set(message.room_id, newGame);
          const letters = newGame.getLettersToShow();
          let output = `I'm thinking of a ${letters.length} lettered word. Start guessing! `;

          for (let i = 0; i < letters.length; i++) {
            output += letters[i] + " ";
          }

          return message.reply(output);
        }
      }
    } else if (commandName === "end") {
      if (!this.games.get(message.room_id)) {
        return message.reply("There is no game in progress.");
      }

      // Only allow the user that created the game to end it
      if (this.games.get(message.room_id).ownerId !== message.user.id) {
        return message.reply("You must be the owner of this game to end it.");
      }

      const output = this.games.get(message.room_id).gameOver(false);
      this.games.delete(message.room_id);

      return message.reply(output);
    } else if (commandName === "guess") {
      if (!this.games.has(message.room_id)) {
        return message.reply("There is no game in progress for this room.");
      }

      if (!input) {
        return message.reply("Please provide a guess.");
      }

      // Destroy the game after 5 minutes
      const diff = TimeUtilities.difference(
        Date.now(),
        this.games.get(message.room_id).startTime
      );

      if (diff.seconds > 300) {
        this.games.delete(message.room_id);

        return message.reply(
          "The game has ended. Use hangman start to begin another game."
        );
      }

      // Only use the first character as the guess
      input = input[0];

      return message.reply(this.games.get(message.room_id).guess(input));
    }
  }
}
