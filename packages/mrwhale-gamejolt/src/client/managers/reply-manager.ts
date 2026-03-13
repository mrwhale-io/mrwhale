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

/**
 * Configuration for the reply manager
 */
interface ReplyManagerConfig {
  enabled: boolean;
  responseChance: number; // 0-1, chance to respond to triggers
  rateLimitCooldown: number; // milliseconds between responses per room
  maxResponsesPerMinute: number; // global rate limit
}

/**
 * Response pattern configuration
 */
interface ResponsePattern {
  regex: RegExp;
  mentionOnly: boolean;
  responses: string[];
  cooldown?: number; // specific cooldown for this pattern
}

/**
 * Rate limiting tracker
 */
interface RateLimit {
  lastResponse: number;
  responsesThisMinute: number;
  minuteStart: number;
}

const RESPONSES: ResponsePattern[] = [
  {
    regex: /\bharp(o+|oo+)n\b/gi,
    mentionOnly: false,
    cooldown: 30000, // 30 second cooldown for dramatic responses
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
    regex: /\b(whale\s*(song|noise|sound|call))\b/gi,
    mentionOnly: false,
    responses: ["🎶 WoooooOOOOooooOOoo 🎶", "🎶 EeeeeeeeeeEEEEEEEEeeeeee 🎶"],
  },
  {
    regex: /\b(joke|pun|whale\s*joke)\b/gi,
    mentionOnly: true,
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
const SHUT_UP_REGEX =
  /(stfu|shut (the (fuck|hell)\W)?up) (@?Mr\.?\W?whale|whale)/gi;

const COMEBACKS = [
  "Why don't you shut up.",
  "No I don't think I will.",
  "No you shut up.",
  "Nice. Did they teach you that in Anger Management class?",
  "You're not the boss of me.",
  "Please lead by example.",
  "You know you can just disable levels right? 🙄",
  "Shutting up is harder than you think.",
  "I would ask you to be quiet but I don't want to interrupt your screaming into the void.",
];

export class ReplyManager {
  private static readonly DEFAULT_CONFIG: ReplyManagerConfig = {
    enabled: true,
    responseChance: 0.5, // 50% chance
    rateLimitCooldown: 5000, // 5 seconds between responses per room
    maxResponsesPerMinute: 12, // max 12 responses per minute globally
  };

  private config: ReplyManagerConfig;
  private roomRateLimits: Map<number, RateLimit> = new Map();
  private globalRateLimit: RateLimit = {
    lastResponse: 0,
    responsesThisMinute: 0,
    minuteStart: Date.now(),
  };

  constructor(
    private bot: GameJoltBotClient,
    customConfig?: Partial<ReplyManagerConfig>,
  ) {
    this.config = { ...ReplyManager.DEFAULT_CONFIG, ...customConfig };
    registerListeners(this.bot.client, this);

    this.bot.logger?.info("ReplyManager initialized with config:", this.config);
  }

  /**
   * Updates the reply manager configuration
   */
  updateConfig(newConfig: Partial<ReplyManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.bot.logger?.info("ReplyManager configuration updated");
  }

  /**
   * Checks if we can respond based on rate limiting
   */
  private canRespond(roomId: number, patternCooldown?: number): boolean {
    if (!this.config.enabled) return false;

    const now = Date.now();

    // Check global rate limiting
    if (now - this.globalRateLimit.minuteStart > 60000) {
      // Reset minute counter
      this.globalRateLimit.minuteStart = now;
      this.globalRateLimit.responsesThisMinute = 0;
    }

    if (
      this.globalRateLimit.responsesThisMinute >=
      this.config.maxResponsesPerMinute
    ) {
      return false;
    }

    // Check room-specific rate limiting
    const roomLimit = this.roomRateLimits.get(roomId);
    const cooldown = patternCooldown || this.config.rateLimitCooldown;

    if (roomLimit && now - roomLimit.lastResponse < cooldown) {
      return false;
    }

    return true;
  }

  /**
   * Updates rate limiting counters
   */
  private updateRateLimit(roomId: number): void {
    const now = Date.now();

    // Update global counter
    this.globalRateLimit.responsesThisMinute++;
    this.globalRateLimit.lastResponse = now;

    // Update room counter
    this.roomRateLimits.set(roomId, {
      lastResponse: now,
      responsesThisMinute: 0,
      minuteStart: now,
    });
  }

  @on("message")
  protected async onMessage(message: Message): Promise<Message | void> {
    try {
      // Skip own messages
      if (message.user.id === this.bot.chat.currentUser?.id) {
        return;
      }

      // Skip blocked users
      const blockedUsersIds =
        this.bot.client.blockedUsers?.map((blocked) => blocked.user.id) || [];

      if (blockedUsersIds.includes(message.user.id)) {
        return;
      }

      // Check basic rate limiting first
      if (!this.canRespond(message.room_id)) {
        return;
      }

      // Handle whale regex (highest priority)
      if (message.textContent.match(WHALE_REGEX)) {
        this.updateRateLimit(message.room_id);
        const whaleMatch = message.textContent.match(WHALE_REGEX)[0];
        this.bot.logger?.debug(`Responding to whale regex: ${whaleMatch}`);
        return await message.reply(whaleMatch);
      }

      // Handle shut up responses
      if (message.textContent.match(SHUT_UP_REGEX)) {
        this.updateRateLimit(message.room_id);
        const content = new Content("chat-message");
        const comeback =
          COMEBACKS[Math.floor(Math.random() * COMEBACKS.length)];
        content.insertText(`@${message.user.username} ${comeback}`);
        this.bot.logger?.debug(`Responding to shut up with: ${comeback}`);
        return await message.reply(content);
      }

      // Check if in private message
      const pm = this.bot.friendsList?.getByRoom(message.room_id);

      // Handle regular response patterns
      for (const response of RESPONSES) {
        const matches = message.textContent.match(response.regex);

        if (!matches) continue;

        // Check specific pattern cooldown
        if (!this.canRespond(message.room_id, response.cooldown)) {
          continue;
        }

        // Check response conditions
        const shouldRespond =
          Math.random() < this.config.responseChance &&
          (pm ||
            !response.mentionOnly ||
            message.isMentioned ||
            message.textContent.match(WHALE_USER_REGEX));

        if (shouldRespond) {
          this.updateRateLimit(message.room_id);
          const content = new Content("chat-message");
          const selectedResponse =
            response.responses[
              Math.floor(Math.random() * response.responses.length)
            ];
          content.insertText(`@${message.user.username} ${selectedResponse}`);

          this.bot.logger?.debug(
            `Responding to pattern ${response.regex.source} with: ${selectedResponse}`,
          );

          return await message.reply(content);
        }
      }
    } catch (error) {
      this.bot.logger?.error("Error in ReplyManager onMessage:", error);
    }
  }

  @on("user_notification")
  protected async onUserNotification(
    notification: Notification,
  ): Promise<boolean | void> {
    try {
      if (
        notification.type === "post-add" &&
        notification.from_model instanceof User &&
        notification.action_model instanceof FiresidePost
      ) {
        const content = new Content("fireside-post-comment");

        // Handle whale regex
        const whaleMatch = notification.action_model.leadStr.match(WHALE_REGEX);
        if (whaleMatch) {
          content.insertText(whaleMatch[0]);
          this.bot.logger?.debug(
            `Responding to fireside whale regex: ${whaleMatch[0]}`,
          );
          return await this.bot.client.api.comments.addComment(
            notification.action_resource_id,
            notification.action_resource,
            content.contentJson(),
          );
        }

        // Handle regular patterns
        for (const response of RESPONSES) {
          const matches = notification.action_model.leadStr.match(
            response.regex,
          );
          if (
            matches &&
            (!response.mentionOnly ||
              notification.action_model.leadStr.match(WHALE_USER_REGEX))
          ) {
            const selectedResponse =
              response.responses[
                Math.floor(Math.random() * response.responses.length)
              ];
            content.insertText(selectedResponse);

            this.bot.logger?.debug(
              `Responding to fireside pattern with: ${selectedResponse}`,
            );

            return await this.bot.client.api.comments.addComment(
              notification.action_resource_id,
              notification.action_resource,
              content.contentJson(),
            );
          }
        }
      }
    } catch (error) {
      this.bot.logger?.error(
        "Error in ReplyManager onUserNotification:",
        error,
      );
    }
  }

  /**
   * Gets current rate limiting statistics
   */
  getStats() {
    return {
      config: this.config,
      globalResponses: this.globalRateLimit.responsesThisMinute,
      activeRooms: this.roomRateLimits.size,
      roomLimits: Object.fromEntries(this.roomRateLimits),
    };
  }
}
