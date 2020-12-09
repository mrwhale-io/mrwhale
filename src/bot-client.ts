import * as moment from "moment";
import * as chalk from "chalk";
import {
  Client,
  ClientOptions,
  Message,
  User,
  Content,
  Room,
} from "@mrwhale-io/gamejolt";

import { BotOptions } from "./types/bot-options";
import { Command } from "./commands/command";
import { CommandDispatcher } from "./commands/command-dispatcher";
import { CommandLoader } from "./commands/command-loader";
import { ListenerDecorators } from "./util/listener-decorators";
import { FriendRequestManager } from "./managers/friend-request-manager";
import { ReplyManager } from "./managers/reply-manager";
import { CleverbotManager } from "./managers/cleverbot-manager";
import { Timer } from "./timer";
import { UrlManager } from "./managers/url-manager";
import { Database } from "./database/database";
import { LevelManager } from "./managers/level-manager";
import { Policer } from "./managers/policer";

const { on, once, registerListeners } = ListenerDecorators;

export class BotClient extends Client {
  /**
   * Contains all loaded commands.
   */
  commands: Command[] = [];

  /**
   * Prefix denoting a command call.
   */
  prefix: string;

  /**
   * Contains the time the bot started.
   */
  startTime: number;

  /**
   * The user identifier of the bot owner.
   */
  ownerId: number;

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
    this.prefix = botOptions.prefix;
    this.ownerId = botOptions.ownerId;

    this.commandDispatcher = new CommandDispatcher(this);
    this.commandLoader = new CommandLoader(this);
    this.timeouts = new Set();
    this.intervals = new Set();

    this.commandLoader.loadCommands();
    this.friendRequestManager = new FriendRequestManager(this);
    this.replyManager = new ReplyManager(this);
    this.urlManager = new UrlManager(this);
    this.levelManager = new LevelManager(this);
    this.policer = new Policer(this);

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

    const interval = 0.2;
    const roomIds = this.chat.groupChats.map((group) => group.id);
    const timer = new Timer(this, "join-groups", interval, async () => {
      if (roomIds.length > 0) {
        const roomId = roomIds.shift();
        console.log(`Joining group chat: ${roomId}`);
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
    console.log(
      `Client ready! Connected as @${this.chat.currentUser.username}`
    );

    await Database.instance().init();
  }

  @on("message")
  protected onMessage(message: Message): void {
    this.logMessage(message);
  }

  @on("notification")
  protected onNotification(message: Message): void {
    if (message && !this.chat.roomChannels[message.room_id]) {
      this.chat.joinRoom(message.room_id).receive("ok", () => {
        this.emit("message", message);
      });
    }
  }

  @on("friend_online")
  protected onFriendOnline(friend: User): void {
    if (friend) {
      console.log(`Friend @${friend.username} is online`);
    }
  }

  @on("friend_offline")
  protected onFriendOffline(friend: User): void {
    if (friend) {
      this.chat.leaveRoom(friend.room_id);
      console.log(`Friend @${friend.username} is offline`);
    }
  }

  @on("friend_add")
  protected onFriendAdd(friend: User): void {
    if (friend) {
      console.log(`User @${friend.username} added as friend`);
      this.chat.joinRoom(friend.room_id).receive("ok", () => {
        const content = new Content();
        const nodes = [
          content.textNode(`Thank you for adding me as a friend! Use `),
          content.textNode(`${this.prefix}help`, [
            content.code(`${this.prefix}help`),
          ]),
          content.textNode(` for a list of commands.`),
        ];
        content.insertNewNode(nodes);

        this.chat.sendMessage(content.contentJson(), friend.room_id);
      });
    }
  }

  @on("group_add")
  protected onGroupAdd(group: Room): void {
    if (group) {
      console.log(`Added to a group`, group);
      this.chat.joinRoom(group.id).receive("ok", () => {
        const content = new Content();
        const nodes = [
          content.textNode(`Thank you for adding me to your group! Use `),
          content.textNode(`${this.prefix}help`, [
            content.code(`${this.prefix}help`),
          ]),
          content.textNode(` for a list of commands.`),
        ];
        content.insertNewNode(nodes);

        this.chat.sendMessage(content.contentJson(), group.id);
      });
    }
  }

  @on("member_add")
  protected onMemberAdd(data: { room_id: number; members: User[] }): void {
    if (data.members) {
      const content = new Content();
      const members = data.members
        .filter((member) => member.id !== this.userId)
        .map((member) => member.display_name)
        .join(", ");

      if (members) {
        content.insertText(`${members} was just added to the group.`);
        this.chat.sendMessage(content.contentJson(), data.room_id);
      }
    }
  }

  private logMessage(msg: Message) {
    const timestamp = moment().format("hh:mm");
    const user = msg.user;
    const room = `Room ${msg.room_id}`;
    const message = msg.textContent;

    if (message !== "") {
      console.log(
        `${chalk.yellow(room)} | ${timestamp} ${chalk.green(
          user.display_name
        )} - ${message}`
      );
    }
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
