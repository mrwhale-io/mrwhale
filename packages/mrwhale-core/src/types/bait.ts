import { BaseItem } from "./base-item";

/**
 * Represents the bait items.
 * Extends the BaseItem interface with additional properties specific to bait.
 */
export interface Bait extends BaseItem {
  /**
   * Effectiveness of the bait in attracting fish.
   */
  effectiveness: number;

  /**
   * The minimum level required to buy this bait.
   */
  minLevel: number;
}
