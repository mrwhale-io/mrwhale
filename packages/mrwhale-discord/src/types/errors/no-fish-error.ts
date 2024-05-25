export class NoFishError extends Error {
  constructor(message: string = "No fish available to catch.") {
    super(message);
    this.name = "NoFishError";
  }
}
