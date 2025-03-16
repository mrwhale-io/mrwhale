import { Block } from "../../structures/block";
import { Endpoints } from "../../constants";
import { ApiData } from "../../types/api-data";
import { BlockPayload } from "../../types/block-payload";
import { UnBlockPayload } from "../../types/unblock-payload";
import { BlockedUsersPayload } from "../../types/blocked-users-payload";
import { APIRequestManager } from "./api-request-manager";

/**
 * API request manager for blocking users.
 */
export class BlockManager extends APIRequestManager {
  /**
   * Gets a list of blocked users.
   * @returns A list of blocked users.
   */
  async getBlockedUsers(): Promise<Block[]> {
    const data = await this.get<ApiData<BlockedUsersPayload>>(Endpoints.blocks);
    return data.payload?.blocks?.map((block) => new Block(block)) || [];
  }

  /**
   * Blocks a user.
   * @param username The username of the user to block.
   * @returns A boolean indicating whether the user was successfully blocked.
   */
  async blockUser(username: string): Promise<boolean> {
    const data = await this.post<ApiData<BlockPayload>>(Endpoints.block, {
      username,
    });
    return data.payload?.success || false;
  }

  /**
   * Unblocks a user.
   * @param blockId The identifier of the block to unblock.
   * @returns A boolean indicating whether the user was successfully unblocked.
   */
  async unblockUser(blockId: number): Promise<boolean> {
    const data = await this.post<ApiData<UnBlockPayload>>(
      Endpoints.unblock(blockId)
    );
    return data.payload?.success || false;
  }
}
