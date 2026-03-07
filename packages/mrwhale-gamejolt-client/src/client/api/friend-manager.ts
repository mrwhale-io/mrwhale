import { FriendRequest } from "../../structures/friend-request";
import { Endpoints } from "../../constants";
import { ApiData } from "../../types/api-data";
import { APIRequestManager } from "./api-request-manager";
import {
  FriendRequestAcceptPayload,
  FriendRequestPayload,
} from "../../types/payloads";

/**
 * API manager for Game Jolt friend system operations.
 * 
 * The FriendManager handles all operations related to friend requests, including
 * sending, accepting, and retrieving friend requests. It provides a complete
 * interface for managing social connections on the Game Jolt platform.
 * 
 * ## Features:
 * - **Friend Request Management**: Send and accept friend requests
 * - **Request Listing**: Retrieve pending friend requests
 * - **Status Tracking**: Track the status of friend request operations
 * - **Error Handling**: Comprehensive error handling for social operations
 * 
 * ## Friend System Overview:
 * Game Jolt's friend system allows users to:
 * - Send friend requests to other users
 * - Accept or decline incoming requests
 * - Maintain a friends list for easier communication
 * - Access friend-only features like private chat
 * 
 * @example
 * ```typescript
 * // Get pending friend requests
 * const requests = await client.api.friends.getFriendRequests();
 * console.log(`You have ${requests.length} pending friend requests`);
 * 
 * // Send a friend request
 * const success = await client.api.friends.sendFriendRequest(12345);
 * if (success) {
 *   console.log('Friend request sent!');
 * }
 * 
 * // Accept a friend request
 * if (requests.length > 0) {
 *   const accepted = await client.api.friends.acceptFriendRequest(requests[0].id);
 *   if (accepted) {
 *     console.log('Friend request accepted!');
 *   }
 * }
 * ```
 */
export class FriendManager extends APIRequestManager {
  /**
   * Retrieves all pending friend requests for the authenticated user.
   * 
   * Fetches a complete list of friend requests that are currently pending approval.
   * This includes both incoming requests (from other users) and outgoing requests
   * (sent by the authenticated user) that haven't been responded to yet.
   * 
   * @returns A Promise that resolves to an array of FriendRequest objects.
   * @throws {Error} When the API request fails due to network issues or server errors.
   * 
   * @example
   * ```typescript
   * try {
   *   const pendingRequests = await friendManager.getFriendRequests();
   *   
   *   console.log(`Found ${pendingRequests.length} pending requests`);
   *   
   *   pendingRequests.forEach(request => {
   *     console.log(`Request from: ${request.user.username}`);
   *     console.log(`Sent: ${request.created_on}`);
   *   });
   * } catch (error) {
   *   console.error('Failed to fetch friend requests:', error);
   * }
   * ```
   */
  async getFriendRequests(): Promise<FriendRequest[]> {
    const data = await this.get<ApiData<FriendRequestPayload>>(
      Endpoints.friends.requests,
    );
    return (
      data.payload?.requests?.map(
        (request) => new FriendRequest(this.client, request),
      ) || []
    );
  }

  /**
   * Sends a friend request to another user.
   * 
   * Initiates a friend request to the specified user. The target user will receive
   * a notification and can choose to accept or decline the request.
   * 
   * @param id - The unique user ID of the person to send a friend request to.
   * @returns A Promise that resolves to `true` if the request was sent successfully, `false` otherwise.
   * @throws {Error} When the API request fails due to network issues or server errors.
   * 
   * @example
   * ```typescript
   * // Send friend request to user with ID 12345
   * try {
   *   const success = await friendManager.sendFriendRequest(12345);
   *   
   *   if (success) {
   *     console.log('Friend request sent successfully!');
   *     // The user will receive a notification about your request
   *   } else {
   *     console.log('Failed to send friend request');
   *     // This could happen if already friends, request pending, or user doesn\'t exist
   *   }
   * } catch (error) {
   *   console.error('Error sending friend request:', error);
   * }
   * ```
   * 
   * @remarks
   * - Cannot send requests to users you're already friends with
   * - Cannot send duplicate requests to the same user
   * - The target user must exist and have an active account
   * - Some users may have privacy settings that block friend requests
   */
  async sendFriendRequest(id: number): Promise<boolean> {
    const data = await this.post<ApiData<FriendRequestAcceptPayload>>(
      Endpoints.friends.request(id),
      { _removed: false, target_user_id: id },
    );
    return data.payload?.success || false;
  }

  /**
   * Accepts a pending friend request.
   * 
   * Accepts an incoming friend request, establishing a mutual friendship connection.
   * Both users will be added to each other's friends lists and can access
   * friend-specific features.
   * 
   * @param id - The unique ID of the friend request to accept.
   * @returns A Promise that resolves to `true` if the request was accepted successfully, `false` otherwise.
   * @throws {Error} When the API request fails due to network issues or server errors.
   * 
   * @example
   * ```typescript
   * // Accept the first pending friend request
   * try {
   *   const requests = await friendManager.getFriendRequests();
   *   
   *   if (requests.length > 0) {
   *     const firstRequest = requests[0];
   *     const success = await friendManager.acceptFriendRequest(firstRequest.id);
   *     
   *     if (success) {
   *       console.log(`Now friends with ${firstRequest.user.username}!`);
   *       // You can now send private messages and access friend features
   *     } else {
   *       console.log('Failed to accept friend request');
   *     }
   *   }
   * } catch (error) {
   *   console.error('Error accepting friend request:', error);
   * }
   * ```
   * 
   * @remarks
   * - The request ID must be valid and belong to a pending request for your account
   * - Accepting a request immediately establishes the friendship
   * - Both users gain access to friend-only features like private chat
   * - Invalid or expired request IDs will return false
   */
  async acceptFriendRequest(id: number): Promise<boolean> {
    const data = await this.post<ApiData<FriendRequestAcceptPayload>>(
      Endpoints.friends.accept(id),
    );
    return data.payload?.success || false;
  }
}
