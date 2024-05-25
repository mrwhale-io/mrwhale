import { FishingRodNames } from "./fishing-rod-names";
import { BaseItem } from "./base-item";

/**
 * Represents a fishing rod.
 * Extends the BaseItem interface with additional properties specific to fishing rods.
 * @template FishingRodNames The specific type for the fishing rod names.
 */
export interface FishingRod extends BaseItem<FishingRodNames> {
  /**
   * Multiplier affecting the probability of catching fish with this rod.
   */
  probabilityMultiplier: number;

  /**
   * Maximum rarity level of fish that can be caught with this rod.
   */
  maxCatchableRarity: number;

  /**
   * Number of casts the rod can perform before breaking or needing maintenance.
   */
  casts: number;

  /**
   * Delay time in seconds between each cast.
   */
  delay: number;

  /**
   * The minimum level required to buy this fishing rod.
   */
  minLevel: number,
}
