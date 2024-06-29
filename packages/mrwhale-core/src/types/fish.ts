import { FishRarity } from "./fish-rarity";
import { FishTypeNames } from "./fish-type-names";

/**
 * Interface representing a fish that can be caught in the game.
 */
export interface Fish {
  /**
   * Unique identifier for the fish.
   */
  id: number;

  /**
   * Name of the fish.
   */
  name: FishTypeNames;

  /**
   * Description of the fish.
   */
  description: string;

  /**
   * Icon representing the fish, usually an emoji or image URL.
   */
  icon: string;

  /**
   * Monetary worth of the fish in the game's currency.
   */
  worth: number;

  /**
   * Experience points (EXP) awarded for catching the fish.
   */
  expWorth: number;

  /**
   * Health points (HP) awarded for catching the fish.
   */
  hpWorth: number;

  /**
   * Base probability of catching this fish.
   */
  probability: number;

  /**
   * Rarity category of the fish.
   */
  rarity: FishRarity;

  /**
   * Rarity level of the fish, used for determining catchability.
   */
  rarityLevel: number;
}
