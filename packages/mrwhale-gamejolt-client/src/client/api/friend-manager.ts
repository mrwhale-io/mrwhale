import { FriendRequest } from "../../structures/friend-request";
import { Endpoints } from "../../constants";
import { ApiData } from "../../types/api-data";
import { FriendRequestPayload } from "../../types/friend-request-payload";
import { FriendRequestAcceptPayload } from "../../types/friend-request-accept-payload";
import { APIRequestManager } from "./api-request-manager";

/**
 * API request manager for friend requests.
 */
export class FriendManager extends APIRequestManager {
  /**
   * Gets a list of friend requests for the client user.
   * @returns A list of friend requests.
   */
  async getFriendRequests(): Promise<FriendRequest[]> {
    const data = await this.get<ApiData<FriendRequestPayload>>(
      Endpoints.requests
    );
    return (
      data.payload?.requests?.map(
        (request) => new FriendRequest(this.client, request)
      ) || []
    );
  }

  /**
   * Sends a friend request to a user.
   * @param id The user id to send the friend request to.
   * @returns A boolean indicating whether the request was successful.
   */
  async sendFriendRequest(id: number): Promise<boolean> {
    const data = await this.post<ApiData<FriendRequestAcceptPayload>>(
      Endpoints.friend_request(id),
      { _removed: false, target_user_id: id }
    );
    return data.payload?.success || false;
  }

  /**
   * Accepts a friend request.
   * @param id The friend request id to accept.
   * @returns A boolean indicating whether the request was successful.
   */
  async acceptFriendRequest(id: number): Promise<boolean> {
    const data = await this.post<ApiData<FriendRequestAcceptPayload>>(
      Endpoints.friend_accept(id)
    );
    return data.payload?.success || false;
  }
}
