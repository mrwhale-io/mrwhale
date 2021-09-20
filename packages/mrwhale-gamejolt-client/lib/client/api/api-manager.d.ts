/// <reference types="node" />
import { AxiosInstance, AxiosResponse } from "axios";
import { Readable } from "stream";
import { Client } from "../client";
import { FriendRequest } from "../../structures/friend-request";
import { ContentContext } from "../../content/content-context";
import { MediaItem } from "../../structures/media-item";
import { Game } from "../../structures/game";
import { GameOverview } from "../../structures/game-overview";
/**
 * Manages site api actions.
 */
export declare class APIManager {
    client: Client;
    axios: AxiosInstance;
    private base;
    /**
     * Creates an instance of APIManager.
     * @param client The game jolt client.
     * @param frontend The session identifier.
     * @param base The base api url.
     */
    constructor(client: Client, frontend: string, base: string);
    /**
     * Fetches friend requests for the client user.
     */
    getFriendRequests(): Promise<FriendRequest[]>;
    /**
     * Accepts a friend request with the given id.
     * @param id The identifier of the friend request.
     */
    friendAccept(id: number): Promise<boolean>;
    /**
     * Send a friend request.
     * @param id The identifier of the user.
     */
    friendRequest(id: number): Promise<FriendRequest>;
    /**
     * Get a game with passed game Id.
     * @param gameId The identifier of the game.
     */
    getGame(gameId: number): Promise<Game>;
    /**
     * Get a games overview with passed game id.
     * @param gameId The identifier of the game overview.
     */
    getGameOverview(gameId: number): Promise<GameOverview>;
    /**
     * Add comment to a resource.
     * @param resourceId The identifier of the resource.
     * @param resource The resource.
     * @param content The content of the comment.
     */
    comment(resourceId: number, resource: string, content: string): Promise<AxiosResponse<unknown>>;
    /**
     * Upload a media item.
     * @param file The media file.
     * @param parentId The identifier of the parent resource.
     * @param type The context type.
     */
    mediaUpload(file: Readable, parentId: number, type: ContentContext): Promise<MediaItem>;
    /**
     * Create a temp chat resource.
     * @param roomId The identifier of the room.
     */
    chatTempResource(roomId: number): Promise<AxiosResponse<any>>;
}
