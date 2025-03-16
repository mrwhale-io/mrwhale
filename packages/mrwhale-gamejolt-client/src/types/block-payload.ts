import { Block } from "../structures/block";

/**
 * Represents a block payload from the API.
 */
export interface BlockPayload {
  /**
   * The block data.
   */
  block: Partial<Block>;

  /**
   * Whether the block was successful.
   */
  success: boolean;
}
