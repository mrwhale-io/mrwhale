import { APIClientOptions } from "../../types/api-client-options";
import { FriendManager } from "./friend-manager";
import { BlockManager } from "./block-manager";
import { GameManager } from "./game-manager";
import { CommentManager } from "./comment-manager";
import { MediaManager } from "./media-manager";
import { Client } from "../client";

/**
 * The APIManager class is responsible for managing various services related to the API.
 * It provides access to services such as friends, blocks, games, comments, and media.
 */
export class APIManager {
  /**
   * Manages the client user's friends.
   */
  readonly friends: FriendManager;

  /**
   * Manages the client user's blocks.
   */
  readonly blocks: BlockManager;

  /**
   * Manages Game Jolt games.
   */
  readonly games: GameManager;

  /**
   * Manages game comments.
   */
  readonly comments: CommentManager;

  /**
   * The Game Jolt client instance.
   */
  readonly client: Client;

  /**
   * Manages media items.
   * This includes images, videos, and other media content.
   * Media items can be associated with games, users, and other resources.
   */
  media: MediaManager;

  constructor(client: Client, options: APIClientOptions) {
    this.client = client;
    this.friends = new FriendManager(client, options);
    this.blocks = new BlockManager(client, options);
    this.games = new GameManager(client, options);
    this.comments = new CommentManager(client, options);
    this.media = new MediaManager(client, options);
  }
}
