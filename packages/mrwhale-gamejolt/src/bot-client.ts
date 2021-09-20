import {
  Client,
  ClientOptions,
  Message,
  User,
  Content,
  Room,
  RoomType,
} from "@mrwhale-io/gamejolt-client";
import { GameJolt } from "joltite.js";

import { BotOptions } from "./types/bot-options";
import { Command } from "./commands/command";
import { CommandDispatcher } from "./commands/command-dispatcher";
import { CommandLoader } from "./commands/command-loader";
import { ListenerDecorators } from "./util/listener-decorators";
import { FriendRequestManager } from "./managers/friend-request-manager";
import { ReplyManager } from "./managers/reply-manager";
import { CleverbotManager } from "./managers/cleverbot-manager";
import { Timer } from "./util/timer";
import { UrlManager } from "./managers/url-manager";
import { Database } from "./database/database";
import { LevelManager } from "./managers/level-manager";
import { Policer } from "./managers/policer";
import { logger } from "./util/logger";
import { code } from "./util/markdown-helpers";
import { settingsManager } from "./managers/settings-manager";

const { on, once, registerListeners } = ListenerDecorators;

export class BotClient extends Client {
  /**
   * Contains all loaded commands.
   */
  commands: Command[] = [];

  /**
   * Default prefix denoting a command call.
   */
  defaultPrefix: string;

  /**
   * Contains the time the bot started.
   */
  startTime: number;

  /**
   * The user identifier of the bot owner.
   */
  ownerId: number;

  /**
   * Bot client logging instance.
   */
  readonly logger = logger;

  /**
   * The game api client.
   */
  readonly gameApi: GameJolt;

  /**
   * The settings manager.
   */
  readonly settings: settingsManager;

  /**
   * Returns the chat client uptime.
   */
  get uptime(): number {
    return Date.now() - this.chat.startTime;
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
  private readonly commandDispatcher: CommandDispatcher;
  private readonly commandLoader: CommandLoader;
  private readonly friendRequestManager: FriendRequestManager;
  private readonly replyManager: ReplyManager;
  private readonly cleverbotManager: CleverbotManager;
  private readonly urlManager: UrlManager;
  private readonly levelManager: LevelManager;
  private readonly policer: Policer;

  /**
   * @param clientOptions The game jolt client options.
   * @param botOptions The bot options.
   */
  constructor(clientOptions: ClientOptions, botOptions: BotOptions) {
    super(clientOptions);
    this.defaultPrefix = botOptions.prefix;
    this.ownerId = botOptions.ownerId;

    this.commandDispatcher = new CommandDispatcher(this);
    this.commandLoader = new CommandLoader(this);
    this.timeouts = new Set();
    this.intervals = new Set();
    this.settings = new settingsManager();

    this.commandLoader.loadCommands();
    this.friendRequestManager = new FriendRequestManager(this);
    this.replyManager = new ReplyManager(this);
    this.urlManager = new UrlManager(this);
    this.levelManager = new LevelManager(this);
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

    registerListeners(this);
  }

  @once("chat_ready")
  protected async onChatReady(): Promise<void> {
    this.commandDispatcher.ready = true;

    let index = 0;
    const interval = 0.3;
    const roomIds =
      this.chat.groupIds || this.chat.groups.map((group) => group.id);

    const timer = new Timer(this, "join-groups", interval, async () => {
      if (index < roomIds.length) {
        const roomId = roomIds[index++];
        this.logger.info(`Joining group chat: ${roomId}`);
        this.chat.joinRoom(roomId);
      } else {
        timer.destroy();
      }
    });
    this.emit("client_ready");
  }

  @once("client_ready")
  protected async onClientReady(): Promise<void> {
    this.startTime = Date.now();
    this.logger.info(
      `Client ready! Connected as @${this.chat.currentUser.username}`
    );

    await Database.instance().init();
    this.settings.init();
  }

  @on("notification")
  protected onNotification(message: Message): void {
    if (message && !this.chat.roomChannels[message.room_id]) {
      this.chat.joinRoom(message.room_id).receive("ok", () => {
        this.emit("message", message);
      });
    }
  }

  @on("friend_add")
  protected onFriendAdd(friend: User): void {
    if (friend) {
      this.logger.info(
        `User @${friend.username} (${friend.id}) added as friend`
      );
      this.chat.joinRoom(friend.room_id).receive("ok", () => {
        const message = `Thank you for adding me as a friend! Use ${code(
          `${this.getPrefix(friend.room_id)}help`
        )} for a list of commands.`;

        this.chat.sendMessage(message, friend.room_id);
      });
    }
  }

  @on("group_add")
  protected onGroupAdd(group: Room): void {
    if (group) {
      this.chat.joinRoom(group.id).receive("ok", () => {
        const message = `Thank you for adding me to your group! Use ${code(
          `${this.getPrefix(group.id)}help`
        )} for a list of commands.`;

        this.chat.sendMessage(message, group.id);
      });
      this.logger.info(`Added to a group chat with id: ${group.id}`);
    }
  }

  @on("member_add")
  protected onMemberAdd(data: { room_id: number; members: User[] }): void {
    const room = this.chat.activeRooms[data.room_id];

    if (data.members && room && room.type === RoomType.ClosedGroup) {
      const members = data.members
        .filter((member) => member.id !== this.userId)
        .map((member) => `@${member.username}`);

      const content = new Content().insertText(
        `👋 ${members.join(" ")} was just added to the group.`
      );
      this.chat.sendMessage(content, data.room_id);
      this.logger.info(
        `${members.join(",")} were added to group chat with id: ${data.room_id}`
      );
    }
  }

  @on("member_leave")
  protected onMemberLeave(data: { room_id: number; member: User }): void {
    const room = this.chat.activeRooms[data.room_id];

    if (data.member && room && room.type === RoomType.ClosedGroup) {
      const content = new Content().insertText(
        `@${data.member.username} just left the group.`
      );

      this.chat.sendMessage(content, data.room_id);
      this.logger.info(
        `${data.member.username} (${data.member.id}) left group chat with id: ${data.room_id}`
      );
    }
  }

  @on("owner_sync")
  protected onOwnerSync(data: { room_id: number; owner_id: number }): void {
    const room = this.chat.activeRooms[data.room_id];

    if (room && room.owner) {
      const content = new Content().insertText(
        `👑 @${room.owner.username} just became the group owner.`
      );

      this.chat.sendMessage(content, data.room_id);
      this.logger.info(
        `${room.owner.username} (${room.owner.id}) became owner of group chat with id: ${data.room_id}`
      );
    }
  }

  /**
   * Gets the room prefix.
   * @param roomId The room prefix.
   */
  getPrefix(roomId: number): string {
    return this.settings.get(roomId, "prefix", this.defaultPrefix) as string;
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

  /**
   * Reload a command.
   * @param command The name of the command to reload.
   */
  reloadCommand(command: string): void {
    if (!command) {
      throw new Error(`A command name or 'all' must be provided.`);
    }

    if (command === "all") {
      this.commandLoader.loadCommands();
    } else {
      this.commandLoader.reloadCommand(command);
    }
  }
}
