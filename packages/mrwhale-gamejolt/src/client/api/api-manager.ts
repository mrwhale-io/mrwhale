import Axios, { AxiosInstance, AxiosResponse } from "axios";
import * as FormData from "form-data";
import { Readable } from "stream";

import { Client } from "../client";
import { Endpoints } from "../../constants";
import { FriendRequest } from "../../structures/friend-request";
import { ContentContext } from "../../content/content-context";
import { MediaItem } from "../../structures/media-item";
import { Game } from "../../structures/game";
import { GameOverview } from "../../structures/game-overview";

interface ApiData<T> {
  payload: T;
}

interface FriendRequestPayload {
  requests: Partial<FriendRequest[]>;
}

interface FriendRequestAcceptPayload {
  success: boolean;
}

/**
 * Manages site api actions.
 */
export class APIManager {
  client: Client;
  axios: AxiosInstance;

  private base: string;

  /**
   * Creates an instance of APIManager.
   * @param client The game jolt client.
   * @param frontend The session identifier.
   * @param base The base api url.
   */
  constructor(client: Client, frontend: string, base: string) {
    this.client = client;
    this.base = base || "https://gamejolt.com/site-api";
    this.axios = Axios.create({
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain",
        Connection: "keep-alive",
        Host: "gamejolt.com",
        Origin: "https://gamejolt.com",
      },
    });
    this.axios.defaults.headers.Cookie = `frontend=${frontend}`;
  }

  /**
   * Fetches friend requests for the client user.
   */
  async getFriendRequests(): Promise<FriendRequest[]> {
    const result = await this.axios.get<ApiData<FriendRequestPayload>>(
      `${this.base}${Endpoints.requests}`
    );
    const payload = result.data.payload;

    if (!payload || !payload.requests) {
      return [];
    }

    return payload.requests.map(
      (request) => new FriendRequest(this.client, request)
    );
  }

  /**
   * Accepts a friend request with the given id.
   * @param id The identifier of the friend request.
   */
  async friendAccept(id: number): Promise<boolean> {
    const result = await this.axios.post<ApiData<FriendRequestAcceptPayload>>(
      `${this.base}${Endpoints.friend_accept(id)}`
    );
    const payload = result.data.payload;

    if (payload) {
      return payload.success;
    } else {
      throw new Error("Failure accepting friend request.");
    }
  }

  /**
   * Send a friend request.
   * @param id The identifier of the user.
   */
  async friendRequest(id: number): Promise<FriendRequest> {
    const result = await this.axios.post(
      `${this.base}${Endpoints.friend_request(id)}`,
      {
        _removed: false,
        target_user_id: id,
      }
    );
    const payload = result.data.payload;

    if (payload.success && payload.userFriendship) {
      return new FriendRequest(this.client, payload.userFriendship);
    } else {
      throw new Error("Failure sending friend request.");
    }
  }

  /**
   * Get a game with passed game Id.
   * @param gameId The identifier of the game.
   */
  async getGame(gameId: number): Promise<Game> {
    const result = await this.axios.get(
      `${this.base}${Endpoints.game(gameId)}`
    );
    const payload = result.data.payload;

    if (payload && payload.game) {
      return new Game(payload.game);
    } else {
      throw new Error("Could not fetch game.");
    }
  }

  /**
   * Get a games overview with passed game id.
   * @param gameId The identifier of the game overview.
   */
  async getGameOverview(gameId: number): Promise<GameOverview> {
    const result = await this.axios.get(
      `${this.base}${Endpoints.game_overview(gameId)}`
    );

    return new GameOverview(result.data.payload);
  }

  /**
   * Add comment to a resource.
   * @param resourceId The identifier of the resource.
   * @param resource The resource.
   * @param content The content of the comment.
   */
  async comment(
    resourceId: number,
    resource: string,
    content: string
  ): Promise<AxiosResponse<unknown>> {
    const result = await this.axios.post(
      `${this.base}${Endpoints.comments_save}`,
      {
        _removed: false,
        isFollowPending: false,
        comment_content: content,
        resource,
        resource_id: resourceId,
      }
    );

    return result;
  }

  /**
   * Upload a media item.
   * @param file The media file.
   * @param parentId The identifier of the parent resource.
   * @param type The context type.
   */
  async mediaUpload(
    file: Readable,
    parentId: number,
    type: ContentContext
  ): Promise<MediaItem> {
    const url = `${this.base}${Endpoints.media_upload}`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("parent_id", parentId);

    const result = await this.axios.post(url, formData, {
      maxContentLength: Infinity,
      headers: {
        "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
      },
    });

    const payload = result.data.payload;

    if (payload.success && payload.mediaItem) {
      return new MediaItem(payload.mediaItem);
    } else if (!payload.success && payload.errors.file) {
      const mediaItemsResult = await this.axios.post(
        `${this.base}${Endpoints.media_items}`,
        {
          type,
          parent_id: parentId,
        }
      );
      const sizePayload = mediaItemsResult.data.payload;
      const maxWidth = sizePayload.maxWidth;
      const maxHeight = sizePayload.maxWidth;
      const maxFilesize = sizePayload.maxFilesize;

      throw new Error(
        `must be less than ${maxFilesize} and dimensions less than ${maxWidth}×${maxHeight}`
      );
    }

    throw new Error(`General failure while uploading file.`);
  }

  /**
   * Create a temp chat resource.
   * @param roomId The identifier of the room.
   */
  async chatTempResource(roomId: number): Promise<AxiosResponse<any>> {
    const url = `${this.base}${Endpoints.temp_resource("chat-message")}`;
    return await this.axios.post(url, {
      roomId,
    });
  }
}
