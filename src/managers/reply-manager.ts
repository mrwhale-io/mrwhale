import {
  Message,
  Notification,
  Content,
  User,
  FiresidePost,
} from "@mrwhale-io/gamejolt";

import { BotClient } from "../bot-client";
import { ListenerDecorators } from "../util/listener-decorators";
import { whalify } from "../util/whalify";

const { on, registerListeners } = ListenerDecorators;

const WHALE_REGEX = /O_{1,5}O/gi;

export class ReplyManager {
  constructor(private client: BotClient) {
    registerListeners(this.client, this);
  }

  @on("message")
  protected async onMessage(message: Message): Promise<void> {
    if (message.user.id === this.client.chat.currentUser.id) {
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
      const whalified = whalify(notification.action_model.leadStr);

      if (
        whalified !== notification.action_model.leadStr &&
        Math.random() < 0.5
      ) {
        const responses = ["I think you mean to say", "Correction"];
        const index = Math.floor(Math.random() * responses.length);

        content.insertText(`${responses[index]}: ${whalified}`);

        this.client.api.comment(
          notification.action_resource_id,
          notification.action_resource,
          content.contentJson()
        );
      } else if (notification.action_model.leadStr.match(WHALE_REGEX)) {
        content.insertText(
          notification.action_model.leadStr.match(WHALE_REGEX)[0]
        );
        this.client.api.comment(
          notification.action_resource_id,
          notification.action_resource,
          content.contentJson()
        );
      }
    }
  }
}
