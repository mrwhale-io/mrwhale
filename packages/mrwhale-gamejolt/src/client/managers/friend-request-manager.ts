import { ListenerDecorators } from "@mrwhale-io/core";
import { FriendRequest } from "@mrwhale-io/gamejolt-client";

import { Timer } from "../../util/timer";
import { GameJoltBotClient } from "../gamejolt-bot-client";

const { on, registerListeners } = ListenerDecorators;

const INTERVAL = 5;

export class FriendRequestManager {
  private friendRequestsQueue: FriendRequest[];
  private timer: Timer;

  constructor(private bot: GameJoltBotClient) {
    this.timer = new Timer(this.bot, "friend-accept", INTERVAL, async () =>
      this.accept()
    );
    this.friendRequestsQueue = [];

    registerListeners(this.bot.client, this);
  }

  @on("friend_requests")
  protected onFriendRequest(requests: FriendRequest[]): void {
    this.friendRequestsQueue = requests;

    if (this.timer) {
      this.timer.destroy();
      this.timer.create();
    }
  }

  private async accept(): Promise<void> {
    if (this.friendRequestsQueue.length > 0) {
      this.friendRequestsQueue.shift().accept();
    } else {
      this.timer.destroy();
    }
  }
}
