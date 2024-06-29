export class HungerLevelFullError extends Error {
  constructor(message: string = "I'm too full to eat this!") {
    super(message);
    this.name = "HungerLevelFullError";
  }
}
