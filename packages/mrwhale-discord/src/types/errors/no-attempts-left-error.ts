export class NoAttemptsLeftError extends Error {
  constructor(message: string = "No remaining attempts to catch fish.") {
    super(message);
    this.name = "NoAttemptsLeftError";
  }
}
