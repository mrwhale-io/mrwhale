"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIManager = void 0;
const axios_1 = require("axios");
const FormData = require("form-data");
const constants_1 = require("../../constants");
const friend_request_1 = require("../../structures/friend-request");
const media_item_1 = require("../../structures/media-item");
const game_1 = require("../../structures/game");
const game_overview_1 = require("../../structures/game-overview");
/**
 * Manages site api actions.
 */
class APIManager {
    /**
     * Creates an instance of APIManager.
     * @param client The game jolt client.
     * @param frontend The session identifier.
     * @param base The base api url.
     */
    constructor(client, frontend, base) {
        this.client = client;
        this.base = base || "https://gamejolt.com/site-api";
        this.axios = axios_1.default.create({
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
    async getFriendRequests() {
        const result = await this.axios.get(`${this.base}${constants_1.Endpoints.requests}`);
        const payload = result.data.payload;
        if (!payload || !payload.requests) {
            return [];
        }
        return payload.requests.map((request) => new friend_request_1.FriendRequest(this.client, request));
    }
    /**
     * Accepts a friend request with the given id.
     * @param id The identifier of the friend request.
     */
    async friendAccept(id) {
        const result = await this.axios.post(`${this.base}${constants_1.Endpoints.friend_accept(id)}`);
        const payload = result.data.payload;
        if (payload) {
            return payload.success;
        }
        else {
            throw new Error("Failure accepting friend request.");
        }
    }
    /**
     * Send a friend request.
     * @param id The identifier of the user.
     */
    async friendRequest(id) {
        const result = await this.axios.post(`${this.base}${constants_1.Endpoints.friend_request(id)}`, {
            _removed: false,
            target_user_id: id,
        });
        const payload = result.data.payload;
        if (payload.success && payload.userFriendship) {
            return new friend_request_1.FriendRequest(this.client, payload.userFriendship);
        }
        else {
            throw new Error("Failure sending friend request.");
        }
    }
    /**
     * Get a game with passed game Id.
     * @param gameId The identifier of the game.
     */
    async getGame(gameId) {
        const result = await this.axios.get(`${this.base}${constants_1.Endpoints.game(gameId)}`);
        const payload = result.data.payload;
        if (payload && payload.game) {
            return new game_1.Game(payload.game);
        }
        else {
            throw new Error("Could not fetch game.");
        }
    }
    /**
     * Get a games overview with passed game id.
     * @param gameId The identifier of the game overview.
     */
    async getGameOverview(gameId) {
        const result = await this.axios.get(`${this.base}${constants_1.Endpoints.game_overview(gameId)}`);
        return new game_overview_1.GameOverview(result.data.payload);
    }
    /**
     * Add comment to a resource.
     * @param resourceId The identifier of the resource.
     * @param resource The resource.
     * @param content The content of the comment.
     */
    async comment(resourceId, resource, content) {
        const result = await this.axios.post(`${this.base}${constants_1.Endpoints.comments_save}`, {
            _removed: false,
            isFollowPending: false,
            comment_content: content,
            resource,
            resource_id: resourceId,
        });
        return result;
    }
    /**
     * Upload a media item.
     * @param file The media file.
     * @param parentId The identifier of the parent resource.
     * @param type The context type.
     */
    async mediaUpload(file, parentId, type) {
        const url = `${this.base}${constants_1.Endpoints.media_upload}`;
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
            return new media_item_1.MediaItem(payload.mediaItem);
        }
        else if (!payload.success && payload.errors.file) {
            const mediaItemsResult = await this.axios.post(`${this.base}${constants_1.Endpoints.media_items}`, {
                type,
                parent_id: parentId,
            });
            const sizePayload = mediaItemsResult.data.payload;
            const maxWidth = sizePayload.maxWidth;
            const maxHeight = sizePayload.maxWidth;
            const maxFilesize = sizePayload.maxFilesize;
            throw new Error(`must be less than ${maxFilesize} and dimensions less than ${maxWidth}×${maxHeight}`);
        }
        throw new Error(`General failure while uploading file.`);
    }
    /**
     * Create a temp chat resource.
     * @param roomId The identifier of the room.
     */
    async chatTempResource(roomId) {
        const url = `${this.base}${constants_1.Endpoints.temp_resource("chat-message")}`;
        return await this.axios.post(url, {
            roomId,
        });
    }
}
exports.APIManager = APIManager;
