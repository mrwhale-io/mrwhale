import { Block } from "../../structures/block";
import { Endpoints } from "../../constants";
import { ApiData } from "../../types/api-data";
import { APIRequestManager } from "./api-request-manager";
import { Client } from "../client";
import { APIClientOptions } from "../../types/api-client-options";
import {
  BlockedUsersPayload,
  BlockPayload,
  UnBlockPayload,
} from "../../types/payloads";

/**
 * API manager for user blocking functionality.
 * 
 * The BlockManager handles all operations related to blocking and unblocking users
 * on the Game Jolt platform. It provides methods to manage blocked users list,
 * block new users, and unblock existing blocked users.
 * 
 * ## Features:
 * - **Block Management**: Block and unblock users by username or block ID
 * - **Blocked Users List**: Retrieve and maintain a list of currently blocked users
 * - **Automatic Synchronization**: Keeps the local blocked users list in sync with server state
 * - **Error Handling**: Proper error handling for API failures
 * 
 * ## Usage:
 * This manager is typically accessed through the main API manager instance
 * and handles all the underlying API requests and state management.
 * 
 * @example
 * ```typescript
 * // Block a user
 * const success = await client.api.blocks.blockUser('spamuser123');
 * if (success) {
 *   console.log('User blocked successfully');
 * }
 * 
 * // Get list of blocked users
 * const blockedUsers = await client.api.blocks.getBlockedUsers();
 * console.log(`You have ${blockedUsers.length} blocked users`);
 * 
 * // Unblock a user
 * const blockToRemove = blockedUsers[0];
 * const unblocked = await client.api.blocks.unblockUser(blockToRemove.id);
 * ```
 */
export class BlockManager extends APIRequestManager {
  /**
   * Gets the list of users currently blocked by the authenticated client user.
   * 
   * This property provides read-only access to the cached list of blocked users.
   * The list is automatically updated when users are blocked or unblocked.
   * 
   * @returns Array of Block objects representing blocked users, or empty array if none.
   */
  get blockedUsers(): Block[] {
    return this._blockedUsers || [];
  }

  /**
   * Internal cache of blocked users.
   * Automatically synchronized with server state through API operations.
   * @private
   */
  private _blockedUsers: Block[] = [];

  /**
   * Creates a new BlockManager instance.
   * 
   * Automatically initializes the blocked users list by fetching current
   * blocked users from the Game Jolt API.
   * 
   * @param client - The Game Jolt client instance.
   * @param options - API client configuration options.
   */
  constructor(client: Client, options: APIClientOptions) {
    super(client, options);
    this.initializeBlockedUsers();
  }

  /**
   * Retrieves the complete list of blocked users from the Game Jolt API.
   * 
   * Makes an API request to fetch all users currently blocked by the authenticated user.
   * Updates the internal cache with the latest data from the server.
   * 
   * @returns A Promise that resolves to an array of Block objects.
   * @throws {Error} When the API request fails or returns invalid data.
   * 
   * @example
   * ```typescript
   * try {
   *   const blockedUsers = await blockManager.getBlockedUsers();
   *   console.log(`Found ${blockedUsers.length} blocked users`);
   *   
   *   blockedUsers.forEach(block => {
   *     console.log(`Blocked: ${block.user.username} (ID: ${block.id})`);
   *   });
   * } catch (error) {
   *   console.error('Failed to fetch blocked users:', error);
   * }
   * ```
   */
  async getBlockedUsers(): Promise<Block[]> {
    const data = await this.get<ApiData<BlockedUsersPayload>>(
      Endpoints.user.blocks,
    );

    this._blockedUsers =
      data.payload?.blocks?.map((block) => new Block(block)) || [];

    return this._blockedUsers;
  }

  /**
   * Blocks a user by their username.
   * 
   * Sends a block request to the Game Jolt API for the specified username.
   * If successful, automatically adds the new block to the local cache.
   * 
   * @param username - The username of the user to block (case-sensitive).
   * @returns A Promise that resolves to `true` if the user was successfully blocked, `false` otherwise.
   * @throws {Error} When the API request fails due to network issues or server errors.
   * 
   * @example
   * ```typescript
   * try {
   *   const success = await blockManager.blockUser('spammer123');
   *   
   *   if (success) {
   *     console.log('User blocked successfully');
   *     // The user will no longer be able to send you messages or friend requests
   *   } else {
   *     console.log('Failed to block user (user may not exist or already blocked)');
   *   }
   * } catch (error) {
   *   console.error('Error blocking user:', error);
   * }
   * ```
   * 
   * @remarks
   * - The username must match exactly (case-sensitive)
   * - Users cannot block themselves
   * - Already blocked users will return false
   * - Invalid usernames will return false
   */
  async blockUser(username: string): Promise<boolean> {
    const data = await this.post<ApiData<BlockPayload>>(Endpoints.user.block, {
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
   * Unblocks a previously blocked user.
   * 
   * Removes a block by its unique identifier. If successful, the user will be
   * automatically removed from the local blocked users cache.
   * 
   * @param blockId - The unique identifier of the block to remove.
   * @returns A Promise that resolves to `true` if the user was successfully unblocked, `false` otherwise.
   * @throws {Error} When the API request fails due to network issues or server errors.
   * 
   * @example
   * ```typescript
   * // Find a blocked user and unblock them
   * const blockedUsers = await blockManager.getBlockedUsers();
   * const userToUnblock = blockedUsers.find(block => 
   *   block.user.username === 'previouslyBlockedUser'
   * );
   * 
   * if (userToUnblock) {
   *   try {
   *     const success = await blockManager.unblockUser(userToUnblock.id);
   *     
   *     if (success) {
   *       console.log('User unblocked successfully');
   *       // The user can now send messages and friend requests again
   *     } else {
   *       console.log('Failed to unblock user');
   *     }
   *   } catch (error) {
   *     console.error('Error unblocking user:', error);
   *   }
   * }
   * ```
   * 
   * @remarks
   * - The block ID must be valid and belong to the authenticated user
   * - Invalid block IDs will return false
   * - Successfully unblocked users can immediately interact with you again
   */
  async unblockUser(blockId: number): Promise<boolean> {
    const data = await this.post<ApiData<UnBlockPayload>>(
      Endpoints.user.unblock(blockId),
    );

    if (data.payload) {
      if (data.payload.success) {
        this._blockedUsers = this._blockedUsers.filter(
          (block) => block.id !== blockId,
        );
      }

      return data.payload.success;
    }
    return false;
  }

  /**
   * Initializes the blocked users list during manager construction.
   * 
   * This method is called automatically when the BlockManager is created
   * to populate the initial cache of blocked users from the server.
   * 
   * @private
   * @returns A Promise that resolves when initialization is complete.
   */
  private async initializeBlockedUsers(): Promise<void> {
    this._blockedUsers = await this.getBlockedUsers();
  }
}
