import { ListenerDecorators, WHALE_REGEX } from "@mrwhale-io/core";
import {
  Message,
  Notification,
  Content,
  User,
  FiresidePost,
} from "@mrwhale-io/gamejolt-client";

import { GameJoltBotClient } from "../gamejolt-bot-client";

const { on, registerListeners } = ListenerDecorators;

export class ReplyManager {
  constructor(private bot: GameJoltBotClient) {
    registerListeners(this.bot.client, this);
  }

  @on("message")
  protected async onMessage(message: Message): Promise<void> {
    if (message.user.id === this.bot.client.chat.currentUser.id) {
      return;
    }

    if (message.textContent.match(WHALE_REGEX)) {
      message.reply(message.toString().match(WHALE_REGEX)[0]);
    }
  }

  @on("user_notification")
  protected async onUserNotification(
    notification: Notification
  ): Promise<void> {
    if (
      notification.type === "post-add" &&
      notification.from_model instanceof User &&
      notification.action_model instanceof FiresidePost
    ) {
      const content = new Content("fireside-post-comment");

      if (notification.action_model.leadStr.match(WHALE_REGEX)) {
        content.insertText(
          notification.action_model.leadStr.match(WHALE_REGEX)[0]
        );
        this.bot.client.api.comment(
          notification.action_resource_id,
          notification.action_resource,
          content.contentJson()
        );
      }
    }
  }
}
