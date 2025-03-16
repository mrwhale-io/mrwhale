import { Block } from "../../structures/block";
import { Endpoints } from "../../constants";
import { ApiData } from "../../types/api-data";
import { BlockPayload } from "../../types/block-payload";
import { UnBlockPayload } from "../../types/unblock-payload";
import { BlockedUsersPayload } from "../../types/blocked-users-payload";
import { APIRequestManager } from "./api-request-manager";
import { Client } from "../client";
import { APIClientOptions } from "../../types/api-client-options";

/**
 * API request manager for blocking users.
 */
export class BlockManager extends APIRequestManager {
  /**
   * Contains all users that are blocked by the client user.
   */
  get blockedUsers(): Block[] {
    return this._blockedUsers || [];
  }

  private _blockedUsers: Block[] = [];

  constructor(client: Client, options: APIClientOptions) {
    super(client, options);
    this.initializeBlockedUsers();
  }

  /**
   * Gets a list of blocked users.
   * @returns A list of blocked users.
   */
  async getBlockedUsers(): Promise<Block[]> {
    const data = await this.get<ApiData<BlockedUsersPayload>>(Endpoints.blocks);

    this._blockedUsers =
      data.payload?.blocks?.map((block) => new Block(block)) || [];

    return this._blockedUsers;
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

    if (data.payload) {
      if (data.payload.success && data.payload.block) {
        this._blockedUsers.push(new Block(data.payload.block));
      }

      return data.payload.success;
    }

    return false;
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

    if (data.payload) {
      if (data.payload.success) {
        this._blockedUsers = this._blockedUsers.filter(
          (block) => block.id !== blockId
        );
      }

      return data.payload.success;
    }
    return false;
  }

  /**
   * Initializes the blocked users list.
   */
  private async initializeBlockedUsers(): Promise<void> {
    this._blockedUsers = await this.getBlockedUsers();
  }
}
