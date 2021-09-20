import { hangman } from "../data/hangman";

const AVAILABLE_LETTERS = "abcdefghijklmnopqrstuvwxyz";

export class HangmanGame {
  /**
   * The letters already guessed by the players.
   */
  lettersGuessed: string;

  /**
   * Correctly guessed letters.
   */
  lettersMatched: string;

  /**
   * The number of letters correctly guessed.
   */
  numLettersMatched: number;

  /**
   * The current word to guess.
   */
  currentWord: string;

  /**
   * The number of lives the player has left.
   */
  lives: number;

  /**
   * Whether the player has won the game.
   */
  won: boolean;

  /**
   * Whether the game is over.
   */
  isGameOver: boolean;

  /**
   * The time the game started in milliseconds.
   */
  startTime: number;

  /**
   * The id of the user who started the game.
   */
  readonly ownerId: number;

  /**
   * @param ownerId The id of the user who started the game.
   */
  constructor(ownerId: number) {
    this.lettersGuessed = "";
    this.lettersMatched = "";
    this.numLettersMatched = 0;
    this.lives = 5;
    this.isGameOver = false;
    this.won = false;
    this.ownerId = ownerId;
  }

  /**
   * Guess a letter for a word.
   * @param letter The letter to guess.
   */
  guess(letter: string): string {
    if (this.isGameOver) {
      return "Game is over. You cannot make another guess.";
    }

    letter = letter.trim().toLowerCase();

    if (AVAILABLE_LETTERS.indexOf(letter) > -1) {
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
    const lettersLeft = this.getLettersToShow();

    for (let i = 0; i < this.currentWord.length; i++) {
      output += lettersLeft[i] + " ";
    }

    return output;
  }

  /**
   * Ends the hangman game.
   * @param [won] Whether the player won or not.
   */
  gameOver(won?: boolean): string {
    this.won = won;
    this.isGameOver = true;

    if (won) {
      return this.printLetters() + " You win!";
    } else {
      return `You lose! The word was ${this.currentWord}.`;
    }
  }

  /**
   * Returns the guessed and un-guessed letters.
   */
  getLettersToShow(): string[] {
    const output: string[] = [];

    for (let i = 0; i < this.currentWord.length; i++) {
      output[i] = "_";
    }

    for (let i = 0; i < this.lettersMatched.length; i++) {
      const char = this.lettersMatched.charAt(i);

      for (let j = 0; j < this.currentWord.length; j++) {
        if (this.currentWord.charAt(j) === char) {
          output[j] = char.toUpperCase();
        }
      }
    }

    return output;
  }

  /**
   * Starts the hangman game.
   */
  start(): boolean {
    const word = hangman[Math.floor(Math.random() * hangman.length)];

    if (!word) {
      return false;
    }

    this.currentWord = word;
    this.startTime = Date.now();

    return true;
  }
}
