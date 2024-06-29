/**
 * Base interface for all shop items.
 * @template T The type of the item name, defaults to string.
 */
export interface BaseItem<T = string> {
  /**
   * Unique identifier for the shop item.
   */
  id: number;

  /**
   * Name of the item.
   */
  name: T;

  /**
   * Description of the item.
   */
  description: string;

  /**
   * The icon for this item.
   */
  icon: string;

  /**
   * Cost of the item in the game's currency.
   */
  cost: number;
}
