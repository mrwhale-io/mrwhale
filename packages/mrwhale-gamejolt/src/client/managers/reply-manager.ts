import { ListenerDecorators, WHALE_REGEX } from "@mrwhale-io/core";
import {
  Message,
  Notification,
  Content,
  User,
  FiresidePost,
} from "@mrwhale-io/gamejolt-client";
import { AxiosResponse } from "axios";

import { GameJoltBotClient } from "../gamejolt-bot-client";

const { on, registerListeners } = ListenerDecorators;

const RESPONSES = [
  {
    regex: /harp(o+)n/gi,
    responses: [
      "h-h-harpoon????!",
      "*swims away fast*",
      "Oh no don't hurt me please!",
      "Oh no not the harpoons!",
    ],
  },
];

const SHUT_UP_REGEX = /(stfu|shut (the (fuck|hell)\W)?up) (@?Mr\.?\W?whale|whale)/gi;

const COMEBACKS = [
  "Why don't you shut up.",
  "No I don't think I will.",
  "No you shut up.",
  "Nice. Did they teach you that in Anger Management class?",
  "You're not the boss of me.",
  "Please lead by example.",
  "You know you can just disable levels right? 🙄",
];

export class ReplyManager {
  constructor(private bot: GameJoltBotClient) {
    registerListeners(this.bot.client, this);
  }

  @on("message")
  protected async onMessage(message: Message): Promise<Message> {
    if (message.user.id === this.bot.chat.currentUser.id) {
      return;
    }

    const blockedUsersIds = this.bot.client.blockedUsers.map(
      (blocked) => blocked.user.id
    );

    if (blockedUsersIds && blockedUsersIds.includes(message.user.id)) {
      return;
    }

    if (message.textContent.match(WHALE_REGEX)) {
      return message.reply(message.toString().match(WHALE_REGEX)[0]);
    } else if (message.textContent.match(SHUT_UP_REGEX)) {
      const content = new Content();
      content.insertText(
        `@${message.user.username} ${
          COMEBACKS[Math.floor(Math.random() * COMEBACKS.length)]
        }`
      );

      return message.reply(content);
    }
  }

  @on("user_notification")
  protected async onUserNotification(
    notification: Notification
  ): Promise<AxiosResponse<unknown>> {
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
        return this.bot.client.api.comment(
          notification.action_resource_id,
          notification.action_resource,
          content.contentJson()
        );
      }

      for (const response of RESPONSES) {
        if (notification.action_model.leadStr.match(response.regex)) {
          content.insertText(
            response.responses[
              Math.floor(Math.random() * response.responses.length)
            ]
          );
          return this.bot.client.api.comment(
            notification.action_resource_id,
            notification.action_resource,
            content.contentJson()
          );
        }
      }
    }
  }
}
