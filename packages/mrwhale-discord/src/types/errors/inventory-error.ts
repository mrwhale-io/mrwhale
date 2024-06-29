export class InventoryError extends Error {
  constructor(item: string) {
    super(`You have no ${item} in your inventory.`);
    this.name = "InventoryError";
  }
}
