import { hangman } from "../data/hangman";

const availableLetters: string = "abcdefghijklmnopqrstuvwzyz";

export class HangmanGame {
  constructor(ownerId: number) {
    this.lettersGuessed = "";
    this.lettersMatched = "";
    this.numLettersMatched = 0;
    this.lives = 5;
    this.isGameOver = false;
    this.won = false;
    this.ownerId = ownerId;
  }

  lettersGuessed: string;
  lettersMatched: string;
  numLettersMatched: number;
  lettersToShow: string[];
  currentWord: string;
  lives: number;
  won: boolean;
  isGameOver: boolean;
  difficulty: "easy" | "medium" | "hard";
  startTime: number;
  started: boolean;
  readonly ownerId: number;

  guess(letter: string) {
    if (this.isGameOver) {
      return "Game is over. You cannot make another guess.";
    }

    letter = letter.trim().toLowerCase();

    if (availableLetters.indexOf(letter) > -1) {
      if (
        (this.lettersGuessed && this.lettersGuessed.indexOf(letter) > -1) ||
        (this.lettersMatched && this.lettersMatched.indexOf(letter) > -1)
      ) {
        return `Letter ${letter} has already been guessed`;
      } else if (this.currentWord.indexOf(letter) > -1) {
        for (let i = 0; i < this.currentWord.length; i++) {
          if (this.currentWord.charAt(i) === letter) {
            this.numLettersMatched++;
          }
        }
        this.lettersMatched += letter;
        if (this.numLettersMatched === this.currentWord.length) {
          return this.gameOver(true);
        }

        let output = "Correct guess! ";
        output += this.printLetters();

        return output;
      } else {
        this.lettersGuessed += letter;
        this.lives--;
        if (this.lives === 0) {
          return this.gameOver(false);
        }

        return `Incorrect. You have ${this.lives} lives remaining.`;
      }
    } else {
      return "Please enter a valid letter";
    }
  }

  private printLetters() {
    let output = "";
    let lettersLeft = this.getLettersToShow();

    for (let i = 0; i < this.currentWord.length; i++) {
      output += lettersLeft[i] + " ";
    }

    return output;
  }

  gameOver(won?: boolean) {
    this.won = won;
    this.isGameOver = true;

    if (won) {
      return this.printLetters() + " You win!";
    } else {
      return `You lose! The word was ${this.currentWord}.`;
    }
  }

  getLettersToShow() {
    let output = [];

    for (let i = 0; i < this.currentWord.length; i++) {
      output[i] = "_";
    }

    for (let i = 0; i < this.lettersMatched.length; i++) {
      let char = this.lettersMatched.charAt(i);

      for (let j = 0; j < this.currentWord.length; j++) {
        if (this.currentWord.charAt(j) === char) {
          output[j] = char.toUpperCase();
        }
      }
    }

    return output;
  }

  start() {
    const word = hangman[Math.floor(Math.random() * hangman.length)];

    if (!word) {
      return false;
    }

    this.currentWord = word;
    this.startTime = Date.now();

    return true;
  }
}
