import { Content, Message } from "@mrwhale-io/gamejolt";

import { HangmanGame } from "../../types/hangman-game";
import { Command } from "../command";
import { TimeUtilities } from "../../util/time";

export default class extends Command {
  constructor() {
    super({
      name: "hangman",
      description: "Play a classic game of hangman.",
      usage: "<prefix> hangman <start|guess|end>",
      argSeparator: " ",
    });
    this.games = new Map<number, HangmanGame>();
  }

  private games: Map<number, HangmanGame>;

  async action(message: Message, [commandName, input]: [string, string]) {
    const content = new Content();
    if (!commandName) {
      content.insertText(
        "Please provide a command. Use !help hangman for more info."
      );

      return message.reply(content);
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
        content.insertText("There is already an active game for this room.");

        return message.reply(content);
      } else {
        let newGame = new HangmanGame(message.user.id);
        let started = newGame.start();

        if (started) {
          this.games.set(message.room_id, newGame);
          let letters = newGame.getLettersToShow();
          let output = `I'm thinking of a ${letters.length} lettered word. Start guessing! `;

          for (let i = 0; i < letters.length; i++) {
            output += letters[i] + " ";
          }
          content.insertText(output);

          return message.reply(content);
        }
      }
    } else if (commandName === "end") {
      if (!this.games.get(message.room_id)) {
        content.insertText("There is no game in progress.");
        return message.reply(content);
      }

      // Only allow the user that created the game to end it
      if (this.games.get(message.room_id).ownerId !== message.user.id) {
        content.insertText("You must be the owner of this game to end it.");

        return message.reply(content);
      }

      let output = this.games.get(message.room_id).gameOver(false);
      this.games.delete(message.room_id);
      content.insertText(output);

      return message.reply(content);
    } else if (commandName === "guess") {
      if (!this.games.has(message.room_id)) {
        content.insertText("There is no game in progress for this room.");

        return message.reply(content);
      }

      if (!input) {
        content.insertText("Please provide a guess.");

        return message.reply(content);
      }

      // Destroy the game after 5 minutes
      let diff = TimeUtilities.difference(
        Date.now(),
        this.games.get(message.room_id).startTime
      );

      if (diff.seconds > 300) {
        this.games.delete(message.room_id);
        content.insertText(
          "The game has ended. Use hangman start to begin another game."
        );

        return message.reply(content);
      }

      // Only use the first character as the guess
      input = input[0];

      content.insertText(this.games.get(message.room_id).guess(input));

      return message.reply(content);
    }
  }
}
