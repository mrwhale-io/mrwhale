export class GuessingGame {
  /**
   * The number between 1-10 to guess.
   */
  number: number;

  /**
   * The number of lives the player has.
   */
  lives: number;

  /**
   * The number of hints the player is allowed.
   */
  hints: number;

  /**
   * The last number the player guessed.
   */
  lastGuess: number;

  /**
   * Whether the game is over.
   */
  isGameOver = false;

  constructor() {
    this.lives = 3;
    this.hints = 1;
    this.lastGuess = -1;
    this.number = Math.floor(Math.random() * 10) + 1;
  }

  /**
   * Guess a number;
   * @param number The number to guess.
   */
  guess(number: number): string {
    const min = 1;
    const max = 10;

    if (number === this.number) {
      this.isGameOver = true;
      return "You guessed the correct number!";
    }

    if (number < min || number > max) {
      return "You must guess a number between 1 and 10.";
    }

    this.lives--;
    this.lastGuess = number;

    if (this.lives < 1) {
      this.isGameOver = true;
      return `You lose! I was thinking of ${this.number}.`;
    }

    return `Incorrect! You have ${this.lives} attempt(s) and ${this.hints} hint(s) remaining.`;
  }

  /**
   * Get a hint.
   */
  hint(): string {
    if (this.lastGuess === -1) {
      return "You must guess a number before I can give you a hint.";
    }

    if (this.hints < 1) {
      return "You have no more hints left.";
    }

    if (this.lastGuess < this.number) {
      this.hints--;
      return "The last number you guessed was too low.";
    }

    return "The last number you guessed was too high.";
  }
}
