import {
  ListenerDecorators,
  BotClient,
  code,
  SimpleStorageProvider,
} from "@mrwhale-io/core";
import {
  ClientOptions,
  Message,
  User,
  Content,
  Room,
  RoomType,
  Client,
} from "@mrwhale-io/gamejolt-client";
import { GameJolt } from "joltite.js";

import { GameJoltBotOptions } from "../types/bot-options";
import { FriendRequestManager } from "./managers/friend-request-manager";
import { ReplyManager } from "./managers/reply-manager";
import { CleverbotManager } from "./managers/cleverbot-manager";
import { Timer } from "../util/timer";
import { UrlManager } from "./managers/url-manager";
import { LevelManager } from "./managers/level-manager";
import { Policer } from "./managers/policer";
import { GameJoltCommandDispatcher } from "./command/gamejolt-command-dispatcher";
import { GameJoltCommand } from "./command/gamejolt-command";
import { RoomStorageLoader } from "../storage/room-storage-loader";

const { on, once, registerListeners } = ListenerDecorators;

export class GameJoltBotClient extends BotClient<GameJoltCommand> {
  /**
   * The game api client.
   */
  readonly gameApi: GameJolt;

  /**
   * The settings manager.
   */
  readonly roomSettings: Map<number, SimpleStorageProvider>;

  /**
   * The Game Jolt bot client.
   */
  readonly client: Client;

  /**
   * Returns the chat client uptime.
   */
  get uptime(): number {
    return Date.now() - this.client.chat.startTime;
  }

  /**
   * Returns the cleverbot on/off status.
   */
  get cleverbot(): boolean {
    return this.cleverbotManager.isEnabled;
  }

  /**
   * Sets the cleverbot on/off status.
   */
  set cleverbot(value: boolean) {
    this.cleverbotManager.isEnabled = value;
  }

  private timeouts: Set<NodeJS.Timer>;
  private intervals: Set<NodeJS.Timer>;
  private readonly commandDispatcher: GameJoltCommandDispatcher;
  private readonly friendRequestManager: FriendRequestManager;
  private readonly replyManager: ReplyManager;
  private readonly cleverbotManager: CleverbotManager;
  private readonly urlManager: UrlManager;
  private readonly levelManager: LevelManager;
  private readonly policer: Policer;
  private readonly roomStorageLoader: RoomStorageLoader;

  /**
   * @param clientOptions The game jolt client options.
   * @param botOptions The bot options.
   */
  constructor(clientOptions: ClientOptions, botOptions: GameJoltBotOptions) {
    super(botOptions);

    this.client = new Client(clientOptions);
    this.commandDispatcher = new GameJoltCommandDispatcher(this);
    this.timeouts = new Set();
    this.intervals = new Set();
    this.roomSettings = new Map<number, SimpleStorageProvider>();

    this.commandLoader.commandType = GameJoltCommand.name;
    this.commandLoader.loadCommands();
    this.friendRequestManager = new FriendRequestManager(this);
    this.replyManager = new ReplyManager(this);
    this.urlManager = new UrlManager(this);
    this.levelManager = new LevelManager(this);
    this.roomStorageLoader = new RoomStorageLoader(this);
    this.policer = new Policer(this);
    this.gameApi = new GameJolt({
      privateKey: botOptions.privateKey,
      gameId: botOptions.gameId,
    });

    if (botOptions.cleverbotToken) {
      this.cleverbotManager = new CleverbotManager(
        this,
        botOptions.cleverbotToken
      );
    }

    this.roomStorageLoader.init();

    registerListeners(this.client, this);
  }

  @once("chat_ready")
  protected async onChatReady(): Promise<void> {
    this.commandDispatcher.ready = true;

    let index = 0;
    const interval = 0.3;
    const roomIds =
      this.client.chat.groupIds ||
      this.client.chat.groups.map((group) => group.id);

    const timer = new Timer(this, "join-groups", interval, async () => {
      if (index < roomIds.length) {
        const roomId = roomIds[index++];
        this.logger.info(`Joining group chat: ${roomId}`);
        this.joinRoom(roomId);
      } else {
        timer.destroy();
      }
    });
    this.client.emit("client_ready");
  }

  @once("client_ready")
  protected async onClientReady(): Promise<void> {
    this.startTime = Date.now();
    this.logger.info(
      `Client ready! Connected as @${this.client.chat.currentUser.username}`
    );
  }

  @on("notification")
  protected onNotification(message: Message): void {
    if (message && !this.client.chat.roomChannels[message.room_id]) {
      this.joinRoom(message.room_id).receive("ok", () => {
        this.client.emit("message", message);
      });
    }
  }

  @on("friend_add")
  protected async onFriendAdd(friend: User): Promise<void> {
    if (friend) {
      const prefix = await this.getPrefix(friend.room_id);
      this.logger.info(
        `User @${friend.username} (${friend.id}) added as friend`
      );
      this.joinRoom(friend.room_id).receive("ok", () => {
        const message = `Thank you for adding me as a friend! Use ${code(
          `${prefix}help`
        )} for a list of commands.`;

        this.client.chat.sendMessage(message, friend.room_id);
      });
    }
  }

  @on("group_add")
  protected async onGroupAdd(group: Room): Promise<void> {
    if (group) {
      const prefix = await this.getPrefix(group.id);
      this.joinRoom(group.id).receive("ok", () => {
        const message = `Thank you for adding me to your group! Use ${code(
          `${prefix}help`
        )} for a list of commands.`;

        this.client.chat.sendMessage(message, group.id);
      });
      this.logger.info(`Added to a group chat with id: ${group.id}`);
    }
  }

  @on("member_add")
  protected onMemberAdd(data: { room_id: number; members: User[] }): void {
    const room = this.client.chat.activeRooms[data.room_id];

    if (data.members && room && room.type === RoomType.ClosedGroup) {
      const members = data.members
        .filter((member) => member.id !== this.client.userId)
        .map((member) => `@${member.username}`);

      const content = new Content().insertText(
        `👋 ${members.join(" ")} was just added to the group.`
      );
      this.client.chat.sendMessage(content, data.room_id);
      this.logger.info(
        `${members.join(",")} were added to group chat with id: ${data.room_id}`
      );
    }
  }

  @on("member_leave")
  protected onMemberLeave(data: { room_id: number; member: User }): void {
    const room = this.client.chat.activeRooms[data.room_id];

    if (data.member && room && room.type === RoomType.ClosedGroup) {
      const content = new Content().insertText(
        `@${data.member.username} just left the group.`
      );

      this.client.chat.sendMessage(content, data.room_id);
      this.logger.info(
        `${data.member.username} (${data.member.id}) left group chat with id: ${data.room_id}`
      );
    }
  }

  @on("owner_sync")
  protected onOwnerSync(data: { room_id: number; owner_id: number }): void {
    const room = this.client.chat.activeRooms[data.room_id];

    if (room && room.owner) {
      const content = new Content().insertText(
        `👑 @${room.owner.username} just became the group owner.`
      );

      this.client.chat.sendMessage(content, data.room_id);
      this.logger.info(
        `${room.owner.username} (${room.owner.id}) became owner of group chat with id: ${data.room_id}`
      );
    }
  }

  /**
   * Gets the room prefix.
   *
   * @param roomId The room prefix.
   */
  async getPrefix(roomId: number): Promise<string> {
    if (!this.roomSettings.has(roomId)) {
      return this.defaultPrefix;
    }

    const settings = this.roomSettings.get(roomId);

    return await settings.get("prefix", this.defaultPrefix);
  }

  setTimeout(
    callback: (...args: unknown[]) => void,
    ms: number,
    ...args: unknown[]
  ): NodeJS.Timeout {
    const timeout = setTimeout(() => {
      callback(...args);
      this.timeouts.delete(timeout);
    }, ms);
    this.timeouts.add(timeout);

    return timeout;
  }

  clearTimeout(timeout: NodeJS.Timer): void {
    clearTimeout(timeout);
    this.timeouts.delete(timeout);
  }

  setInterval(
    callback: (...args: unknown[]) => void,
    ms: number,
    ...args: unknown[]
  ): NodeJS.Timeout {
    const interval = setInterval(callback, ms, ...args);
    this.intervals.add(interval);

    return interval;
  }

  clearInterval(interval: NodeJS.Timer): void {
    clearInterval(interval);
    this.intervals.delete(interval);
  }

  private joinRoom(roomId: number) {
    return this.client.chat.joinRoom(roomId).receive("ok", () => {
      this.roomStorageLoader.loadRoomSettings(roomId);
    });
  }
}
