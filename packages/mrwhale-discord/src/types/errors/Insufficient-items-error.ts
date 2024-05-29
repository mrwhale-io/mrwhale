export class InsufficientItemsError extends Error {
  constructor(item: string, quantity: number) {
    super(`You only have ${quantity} ${item} in your inventory.`);
    this.name = "InsufficientItemsError";
  }
}
