import { Message, Content } from "@mrwhale-io/gamejolt";
import * as profanity from "profanity-util";

import { BotClient } from "../bot-client";

import { ListenerDecorators } from "../util/listener-decorators";

const { on, registerListeners } = ListenerDecorators;

export const rageResponses = [
  "Calm down!",
  "Silence!",
  "Quiet you.",
  "Take your caps lock off.",
  "Use your indoor voice.",
  "Pipe down son, we can hear you just fine.",
  "Why are you shouting?",
];

export const profanityResponses = [
  "Do you kiss your mother with that mouth?",
  "Nice potty mouth.",
  "Stop swearing.",
  "Stop cussing.",
  "Go wash your mouth out with soap.",
  "Watch your language.",
];

interface PolicerMap {
  [roomId: number]: {
    [user: number]: {
      capsLevel: number;
      profanityLevel: number;
      lastCheck: number;
    };
  };
}

export class Policer {
  private policerMap: PolicerMap;

  constructor(private client: BotClient) {
    this.policerMap = {};
    registerListeners(this.client, this);
  }

  @on("message")
  private async onMessage(message: Message) {
    if (
      message.user.id === this.client.chat.currentUser.id ||
      this.client.chat.friendsList.getByRoom(message.room_id)
    ) {
      return;
    }

    if (!this.policerMap[message.room_id]) {
      this.policerMap[message.room_id] = {};
    }

    if (!this.policerMap[message.room_id][message.user.id]) {
      this.policerMap[message.room_id][message.user.id] = {
        capsLevel: 0,
        profanityLevel: 0,
        lastCheck: Date.now(),
      };
    }

    const content = new Content();
    const capsregex = /^[A-Z0-9-!$%#@£^¬&*()_+|~=`{}[\]:";'<>?,./\\]*$/;
    const entry = this.policerMap[message.room_id][message.user.id];

    // Check for profanity
    const profanityScore = (Date.now() - entry.lastCheck) / 1000 / 10;
    entry.profanityLevel = Math.max(entry.profanityLevel - profanityScore, 0);

    if (profanity.check(message.textContent).length > 0) {
      entry.profanityLevel++;

      if (entry.profanityLevel >= 2.0) {
        entry.profanityLevel -= 2.0;

        content.insertText(
          `@${message.user.username} ${
            profanityResponses[
              Math.floor(Math.random() * profanityResponses.length)
            ]
          }`
        );

        return message.reply(content);
      }
    }

    // Check for excessive caps
    const capsScore = (Date.now() - entry.lastCheck) / 1000 / 10;
    entry.capsLevel = Math.max(entry.capsLevel - capsScore, 0);

    if (
      message.textContent.match(capsregex) &&
      message.textContent.length > 5
    ) {
      entry.capsLevel++;

      if (entry.capsLevel >= 2.0) {
        entry.capsLevel -= 2.0;

        content.insertText(
          `@${message.user.username} ${
            rageResponses[Math.floor(Math.random() * rageResponses.length)]
          }`
        );

        return message.reply(content);
      }
    }

    entry.lastCheck = Date.now();

    if (entry.capsLevel <= 0 && entry.profanityLevel <= 0) {
      delete this.policerMap[message.room_id][message.user.id];
    }
  }
}
