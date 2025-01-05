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
    regex: /\bharp(o+|oo+)n\b/gi,
    mentionOnly: false,
    responses: [
      "H-h-harpoon????! 😱",
      "*swims away fast*",
      "Oh no, don't hurt me please! 🐋",
      "Harpoons are terrifying! Stay away! 😨",
      "Who said harpoon?! 😭",
      "Harpoons are my worst nightmare! 😢",
      "A harpoon? That's the stuff of whale horror stories! 😱",
      "Harpoons? Bad news for whales! 😡",
      "Not the harpoons! I thought we were friends! 🐋💔",
      "Harpoons are dangerous! You wouldn't do that to a friend, right? 🥺",
      "Stay safe, everyone. Harpoons are no joke! 🌊",
    ],
  },
  {
    regex: /\b(food|hungry|snack|eat|krill|fish)\b/gi,
    mentionOnly: false,
    responses: [
      "Food? Did someone say krill? 🐟",
      "Hungry? Let's grab some plankton together! 🌊",
      "Snacks? I'm always in the mood for fish! 🐋",
    ],
  },
  {
    regex: /\b(whale\s*(song|noise|sound|call))\b/gi,
    mentionOnly: false,
    responses: ["🎶 WoooooOOOOooooOOoo 🎶", "🎶 EeeeeeeeeeEEEEEEEEeeeeee 🎶"],
  },
  {
    regex: /\b(joke|pun|funny|laugh|whale\s*joke)\b/gi,
    mentionOnly: false,
    responses: [
      "Why don't whales ever get into fights? They don't want to make waves! 🌊",
      "What do whales like to put on their toast? Jellyfish!",
      "Why did the whale cross the ocean? To get to the other tide!",
      "What do whales say when they bump into each other? 'Sorry, didn't sea you there!'",
      "How do whales listen to music? On their blubber-tooth speakers! 🎶",
      "What do whales eat at parties? Fish and ships!",
      "Why don't whales use smartphones? Because they're afraid of the net!",
      "What's a whale's favorite exercise? Doing plank(ton)s!",
      "What do you call a pod of musical whales? An orca-stra! 🎻",
      "What did the whale say to the dolphin? 'Long time no sea!'",
      "What's a whale's favorite game? Swallow the leader!",
      "How do whales communicate during a storm? They use their shell phones! 📱",
      "What's a whale's favorite type of music? Heavy krill metal! 🎸",
      "Why did the whale go to school? To improve its whale-being!",
      "What do you call a lazy whale? A slow-motion ocean commotion!",
      "What do you call a whale who tells tall tales? A fishy storyteller!",
      "Why did the whale blush? It saw the ocean's bottom!",
      "What do whales call an undersea party? A shell-ebration!",
      "How do whales say goodbye? 'Sea you later!'",
      "Why did the whale become a detective? To solve mysteries deep under the sea!",
    ],
  },
  {
    regex: /\b(i'?m\s(?:feeling\s)?(sad|lonely|depressed|down|blue|unhappy|heartbroken|hopeless))\b/gi,
    mentionOnly: false,
    responses: [
      "It's okay to feel sad sometimes. 🐳",
      "You're loved and valued. 🌟",
      "Sending you whale-sized hugs! 🐋",
      "You matter, and I'm here for you. 🌊",
      "The ocean's a big place, but you're never alone in it. 🐳",
      "Even the darkest depths have light. 🐋",
      "Let's take things one wave at a time. 🌊",
      "Cheer up! The ocean's full of sunny days ahead. ☀️",
      "Sad? Let's have a splash party to brighten your day! 🎉",
      "Big waves come and go, but the calm will return. 🐋",
    ],
  },
  {
    regex: /\b(hello|hi|hey|howdy|greetings|whale hello)\b/gi,
    mentionOnly: true,
    responses: [
      "Hello!",
      "Hi there!",
      "Hey!",
      "Whale hello there!",
      "Greetings!",
      "Hey, what's up?",
      "Hey, nice to sea you!",
    ],
  },
  {
    regex: /\b(bye|goodbye|farewell|see\s*you|later|take\s*care)\b/gi,
    mentionOnly: true,
    responses: [
      "Goodbye!",
      "Bye!",
      "Farewell!",
      "See you later!",
      "Take care!",
      "Bye-bye!",
      "Until next time!",
      "Catch you later!",
    ],
  },
];

const WHALE_USER_REGEX = /@?Mr\.?\W?whale|whale/gi;
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

    const pm = this.bot.friendsList.getByRoom(message.room_id);

    for (const response of RESPONSES) {
      const matches = message.textContent.match(response.regex);

      if (
        matches &&
        Math.random() < 0.5 && // 50% chance to respond
        (pm ||
          !response.mentionOnly ||
          message.isMentioned ||
          message.textContent.match(WHALE_USER_REGEX))
      ) {
        const content = new Content();
        content.insertText(
          `@${message.user.username} ${
            response.responses[
              Math.floor(Math.random() * response.responses.length)
            ]
          }`
        );

        return message.reply(content);
      }
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
