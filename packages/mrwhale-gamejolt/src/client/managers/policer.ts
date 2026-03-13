import { ListenerDecorators } from "@mrwhale-io/core";
import { Message, Content, Events } from "@mrwhale-io/gamejolt-client";
import * as profanity from "profanity-util";

import { GameJoltBotClient } from "../gamejolt-bot-client";

const { on, registerListeners } = ListenerDecorators;

/**
 * Default responses for excessive caps usage
 */
export const rageResponses = [
  "There's no need to shout. We can hear you just fine.",
  "Caps lock is cruise control for cool, but you still need to steer.",
  "Take it easy on the caps.",
  "Turn off that caps lock and let's chat normally.",
  "Save the caps for when you really need them.",
  "Let's keep it chill with the typing.",
  "No need to shout, we're all friends here.",
  "This isn't a rock concert, no need for all the caps.", 
];

/**
 * Default responses for profanity detection
 */
export const profanityResponses = [
  "Let's keep the language family-friendly here.",
  "Mind your words, this chat is for everyone.",
  "Language like that isn't welcome here.",
  "Let's express ourselves without the profanity.",
  "Keep it PG, there might be younger gamers around.",
  "Whale's don't like profanity - let's keep it clean for everyone.",
  "Keep the oceans clean, and the chat cleaner.",
];

/**
 * Default responses for spam detection
 */
export const spamResponses = [
  "Please avoid spamming the chat.",
  "Spamming isn't allowed here, please slow down.",
  "Let's keep the chat clear for everyone.",
  "Repeated messages can be disruptive, please stop.",
  "We get it, you have something to say, but let's not spam.",
  "Spamming can lead to penalties, so please refrain from it.",
  "Let's keep the conversation flowing without spamming.",
  "Please give others a chance to speak by not spamming the chat.",
  "Spam is not tolerated, let's keep the chat enjoyable for everyone.",
];

/**
 * Configuration interface for the Policer
 */
interface PolicerConfig {
  enabled: boolean;
  profanity: {
    enabled: boolean;
    threshold: number;
    decayRate: number;
    responses: string[];
  };
  caps: {
    enabled: boolean;
    threshold: number;
    decayRate: number;
    minLength: number;
    responses: string[];
  };
  spam: {
    enabled: boolean;
    maxMessages: number;
    timeWindow: number; // in seconds
    threshold: number;
    responses: string[];
  };
  escalation: {
    enabled: boolean;
    warningThreshold: number;
    kickThreshold: number;
  };
  cleanup: {
    inactiveTime: number; // in milliseconds
    cleanupInterval: number; // in milliseconds
  };
  rateLimiting: {
    enabled: boolean;
    cooldown: number; // in milliseconds
  };
}

/**
 * User violation tracking interface
 */
interface UserViolations {
  capsLevel: number;
  profanityLevel: number;
  spamLevel: number;
  lastCheck: number;
  lastMessage: string;
  messageCount: number;
  lastResponse: number;
  warningCount: number;
  violations: ViolationType[];
}

/**
 * Types of violations that can be detected
 */
enum ViolationType {
  PROFANITY = "profanity",
  CAPS = "caps",
  SPAM = "spam",
}

/**
 * Room-based user tracking map
 */
interface PolicerMap {
  [roomId: number]: {
    [userId: number]: UserViolations;
  };
}

/**
 * Advanced chat moderation system for Game Jolt bot
 *
 * Features:
 * - Configurable profanity detection with escalation
 * - Caps lock spam protection with customizable thresholds
 * - Message spam detection and prevention
 * - Progressive warning and enforcement system
 * - Automatic cleanup of inactive user data
 * - Per-room configuration support
 * - Rate limiting for bot responses
 *
 * @example
 * ```typescript
 * const policer = new Policer(botClient);
 * policer.updateConfig({
 *   profanity: { threshold: 3 },
 *   caps: { enabled: false }
 * });
 * ```
 */
export class Policer {
  /**
   * Default configuration for the policer
   */
  private static readonly DEFAULT_CONFIG: PolicerConfig = {
    enabled: true,
    profanity: {
      enabled: true,
      threshold: 2.0,
      decayRate: 0.1, // per second
      responses: profanityResponses,
    },
    caps: {
      enabled: true,
      threshold: 2.0,
      decayRate: 0.1, // per second
      minLength: 5,
      responses: rageResponses,
    },
    spam: {
      enabled: true,
      maxMessages: 5,
      timeWindow: 10, // seconds
      threshold: 3.0,
      responses: spamResponses,
    },
    escalation: {
      enabled: true,
      warningThreshold: 2,
      kickThreshold: 8,
    },
    cleanup: {
      inactiveTime: 30 * 60 * 1000, // 30 minutes
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
    },
    rateLimiting: {
      enabled: true,
      cooldown: 5000, // 5 seconds
    },
  };

  private policerMap: PolicerMap = {};
  private config: PolicerConfig;
  private cleanupInterval?: NodeJS.Timeout;
  private readonly capsRegex =
    /^[A-Z0-9-!$%#@£^¬&*()_+|~=`{}[\]:";'<>?,./\\]*$/;

  constructor(
    private bot: GameJoltBotClient,
    customConfig?: Partial<PolicerConfig>,
  ) {
    this.config = { ...Policer.DEFAULT_CONFIG, ...customConfig };

    registerListeners(this.bot.client, this);
    this.startCleanupTimer();

    this.bot.logger?.info(
      "Policer initialized with configuration:",
      this.config,
    );
  }

  /**
   * Updates the policer configuration.
   * @param newConfig - Partial configuration to merge with current config.
   */
  updateConfig(newConfig: Partial<PolicerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.bot.logger?.info("Policer configuration updated");
  }

  /**
   * Gets the current configuration.
   */
  getConfig(): Readonly<PolicerConfig> {
    return { ...this.config };
  }

  /**
   * Starts the automatic cleanup timer for inactive user data.
   */
  private startCleanupTimer(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveUsers();
    }, this.config.cleanup.cleanupInterval);
  }

  /**
   * Cleans up inactive user data to prevent memory leaks.
   */
  private cleanupInactiveUsers(): void {
    const now = Date.now();
    const cutoff = now - this.config.cleanup.inactiveTime;
    let cleanedCount = 0;

    try {
      for (const roomId in this.policerMap) {
        for (const userId in this.policerMap[roomId]) {
          const userViolations = this.policerMap[roomId][userId];

          if (
            userViolations.lastCheck < cutoff &&
            userViolations.capsLevel <= 0 &&
            userViolations.profanityLevel <= 0 &&
            userViolations.spamLevel <= 0
          ) {
            delete this.policerMap[roomId][userId];
            cleanedCount++;
          }
        }

        // Clean up empty rooms
        if (Object.keys(this.policerMap[roomId]).length === 0) {
          delete this.policerMap[roomId];
        }
      }

      if (cleanedCount > 0) {
        this.bot.logger?.debug(
          `Cleaned up ${cleanedCount} inactive user records`,
        );
      }
    } catch (error) {
      this.bot.logger?.error("Error during policer cleanup:", error);
    }
  }

  /**
   * Destroys the policer and cleans up resources.
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }

    this.policerMap = {};
    this.bot.logger?.info("Policer destroyed and resources cleaned up");
  }

  /**
   * Main message handler for chat moderation
   */
  @on(Events.MESSAGE)
  private async onMessage(message: Message): Promise<void> {
    try {
      // Skip if policer is disabled
      if (!this.config.enabled) {
        return;
      }

      // Skip bot's own messages and friends
      if (this.shouldSkipMessage(message)) {
        return;
      }

      // Validate message content
      if (!message.textContent?.trim()) {
        return;
      }

      // Initialize tracking for user/room if needed
      const userViolations = this.initializeUserTracking(message);

      // Check for various violations
      await this.checkViolations(message, userViolations);
    } catch (error) {
      this.bot.logger?.error("Error in policer message handler:", error);
    }
  }

  /**
   * Determines if a message should be skipped by the policer.
   * This includes messages sent by the bot itself, messages from private rooms, and messages from room owners (to avoid penalizing them).
   *
   * @param message The message being evaluated for skipping.
   */
  private shouldSkipMessage(message: Message): boolean {
    return (
      message.user.id === this.bot.chat.currentUser?.id ||
      this.bot.friendsList?.getByRoom(message.room_id) !== undefined ||
      message.isRoomOwner
    );
  }

  /**
   * Initializes user tracking for a room/user combination.
   * This method ensures that the necessary data structures are in place to track violations for the user in the specific room. It creates entries in the policer map if they do not already exist, and returns the UserViolations object for the user.
   *
   * @param message The message being processed, used to identify the room and user for tracking.
   * @return The UserViolations object for the user, which contains the current violation levels and history.
   */
  private initializeUserTracking(message: Message): UserViolations {
    // Initialize room if needed
    if (!this.policerMap[message.room_id]) {
      this.policerMap[message.room_id] = {};
    }

    // Initialize user tracking if needed
    if (!this.policerMap[message.room_id][message.user.id]) {
      this.policerMap[message.room_id][message.user.id] = {
        capsLevel: 0,
        profanityLevel: 0,
        spamLevel: 0,
        lastCheck: Date.now(),
        lastMessage: "",
        messageCount: 0,
        lastResponse: 0,
        warningCount: 0,
        violations: [],
      };
    }

    return this.policerMap[message.room_id][message.user.id];
  }

  /**
   * Checks for various types of violations in a message.
   * This includes profanity, excessive caps, and spam. The user's violation levels are updated accordingly, and appropriate responses are generated based on the severity and history of violations.
   *
   * @param message The message to check for violations, containing the content and user information.
   * @param userViolations The current violation levels and history for the user, which will be updated based on the checks performed on the message.
   */
  private async checkViolations(
    message: Message,
    userViolations: UserViolations,
  ): Promise<void> {
    const now = Date.now();
    const timeDiff = (now - userViolations.lastCheck) / 1000;

    // Apply natural decay to violation levels
    this.applyDecay(userViolations, timeDiff);

    // Check for spam (must be first to track message frequency)
    if (this.config.spam.enabled) {
      this.checkSpamViolation(message, userViolations);
    }

    // Check for profanity
    if (this.config.profanity.enabled) {
      this.checkProfanityViolation(message, userViolations);
    }

    // Check for excessive caps
    if (this.config.caps.enabled) {
      this.checkCapsViolation(message, userViolations);
    }

    // Handle violations and responses
    await this.handleViolations(message, userViolations);

    // Update tracking data
    userViolations.lastCheck = now;
    userViolations.lastMessage = message.textContent;
    userViolations.messageCount++;
  }

  /**
   * Applies natural decay to violation levels over time.
   * This helps to prevent users from being permanently penalized for past violations and encourages better behavior over time.
   * The decay is applied based on the time difference since the last check, with configurable decay rates for each violation type.
   *
   * @param userViolations The current violation levels for the user, which will be reduced based on the decay rates.
   * @param timeDiff The time difference in seconds since the last check, used to calculate the amount of decay to apply.
   */
  private applyDecay(userViolations: UserViolations, timeDiff: number): void {
    const profanityDecay = timeDiff * this.config.profanity.decayRate;
    const capsDecay = timeDiff * this.config.caps.decayRate;
    const spamDecay = timeDiff * 0.2; // Spam decays faster

    userViolations.profanityLevel = Math.max(
      0,
      userViolations.profanityLevel - profanityDecay,
    );
    userViolations.capsLevel = Math.max(
      0,
      userViolations.capsLevel - capsDecay,
    );
    userViolations.spamLevel = Math.max(
      0,
      userViolations.spamLevel - spamDecay,
    );
  }

  /**
   * Checks for spam violations (repeated messages, rapid posting).
   * Repeated messages increase the spam level more significantly, while rapid posting increases it based on frequency.
   * If the spam level exceeds the configured threshold, it is marked as a violation.
   *
   * @param message The message to check for spam violations.
   * @param userViolations The current violation levels for the user, which will be updated if a spam violation is detected.
   */
  private checkSpamViolation(
    message: Message,
    userViolations: UserViolations,
  ): void {
    const now = Date.now();
    const timeSinceLastMessage = (now - userViolations.lastCheck) / 1000;

    // Check for repeated message content
    if (
      userViolations.lastMessage === message.textContent &&
      message.textContent.length > 3
    ) {
      userViolations.spamLevel += 1.5;
      userViolations.violations.push(ViolationType.SPAM);
      return;
    }

    // Check for rapid message posting
    if (timeSinceLastMessage < 2) {
      // Less than 2 seconds between messages
      userViolations.spamLevel += 0.5;

      if (userViolations.spamLevel >= this.config.spam.threshold) {
        userViolations.violations.push(ViolationType.SPAM);
      }
    }
  }

  /**
   * Checks for profanity violations.
   * Messages that contain profane words will increase the user's profanity level, and if it exceeds the threshold, it will be marked as a violation.
   * The violation level increases based on the number of profane words detected, with a maximum increase to prevent excessive penalties for very long messages.
   *
   * @param message The message to check for profanity.
   * @param userViolations The current violation levels for the user, which will be updated if a profanity violation is detected.
   */
  private checkProfanityViolation(
    message: Message,
    userViolations: UserViolations,
  ): void {
    try {
      const profanityWords = profanity.check(message.textContent);

      if (profanityWords.length > 0) {
        // Increase violation level based on number of profane words
        userViolations.profanityLevel += Math.min(
          profanityWords.length * 0.5,
          2.0,
        );

        if (userViolations.profanityLevel >= this.config.profanity.threshold) {
          userViolations.violations.push(ViolationType.PROFANITY);
          this.bot.logger?.debug(
            `Profanity detected from user ${
              message.user.username
            }: ${profanityWords.join(", ")}`,
          );
        }
      }
    } catch (error) {
      this.bot.logger?.error("Error checking profanity:", error);
    }
  }

  /**
   * Checks for excessive caps violations.
   * Messages that exceed the configured threshold of uppercase characters (weighted by message length) will be flagged as violations.
   * The violation level increases based on the proportion of uppercase characters and the overall length of the message, with longer messages being weighted more heavily.
   *
   * @param message The message to check for caps violations.
   * @param userViolations The current violation levels for the user, which will be updated if a caps violation is detected.
   */
  private checkCapsViolation(
    message: Message,
    userViolations: UserViolations,
  ): void {
    const text = message.textContent.trim();

    if (
      text.length >= this.config.caps.minLength &&
      this.capsRegex.test(text)
    ) {
      // Weight by message length (longer caps messages are worse)
      const lengthMultiplier = Math.min(text.length / 20, 2.0);
      userViolations.capsLevel += 1.0 * lengthMultiplier;

      if (userViolations.capsLevel >= this.config.caps.threshold) {
        userViolations.violations.push(ViolationType.CAPS);
        this.bot.logger?.debug(
          `Caps violation detected from user ${
            message.user.username
          }: "${text.substring(0, 50)}..."`,
        );
      }
    }
  }

  /**
   * Handles violations and determines appropriate response.
   * This includes sending warning messages, applying penalties, and escalating to kicks if necessary.
   * The response is based on the type of violation and the user's history of violations, with escalation thresholds for repeated offenses.
   *
   * @param message The original message that triggered the violation, used to identify the user and room for response.
   * @param userViolations The current violation levels and history for the user, used to determine the appropriate response and escalation level.
   */
  private async handleViolations(
    message: Message,
    userViolations: UserViolations,
  ): Promise<void> {
    if (userViolations.violations.length === 0) {
      return;
    }

    // Check rate limiting
    if (this.config.rateLimiting.enabled) {
      const timeSinceLastResponse = Date.now() - userViolations.lastResponse;
      if (timeSinceLastResponse < this.config.rateLimiting.cooldown) {
        userViolations.violations = []; // Clear violations but don't respond
        return;
      }
    }

    // Determine response based on violation type and escalation
    const response = this.buildResponse(message, userViolations);

    if (response) {
      try {
        await message.reply(response);
        userViolations.lastResponse = Date.now();
        userViolations.warningCount++;

        // Log the violation
        this.bot.logger?.info(
          `Policer responded to user ${message.user.username} in room ${
            message.room_id
          }: ${userViolations.violations.join(", ")}`,
        );

        // Reduce violation levels after response
        this.applyPenaltyReduction(userViolations);

        // Check for kick escalation if bot is room owner
        await this.checkKickEscalation(message, userViolations);
      } catch (error) {
        this.bot.logger?.error("Error sending policer response:", error);
      }
    }

    // Clear violations after handling
    userViolations.violations = [];
  }

  /**
   * Checks if kick escalation should be applied and executes it if conditions are met.
   * This is only executed if escalation is enabled and the user's warning count has reached the kick threshold.
   * The bot must also be the room owner to perform a kick, and cannot kick the actual room owner.
   *
   * @param message The message that triggered the violation, used to identify the user and room.
   * @param userViolations The current violation levels and history for the user, used to determine if escalation is necessary.
   * @returns A Promise that resolves when the check (and potential kick) is complete.
   */
  private async checkKickEscalation(
    message: Message,
    userViolations: UserViolations,
  ): Promise<void> {
    if (
      !this.config.escalation.enabled ||
      userViolations.warningCount < this.config.escalation.kickThreshold
    ) {
      return;
    }

    // Check if bot is room owner
    if (!this.bot.chat.isRoomOwner(message.room_id)) {
      this.bot.logger?.warn(
        `Cannot kick user ${message.user.username} from room ${message.room_id}: Bot is not room owner`,
      );
      return;
    }

    // Cannot kick the room owner
    const room = this.bot.chat.activeRooms.get(message.room_id);
    if (room && room.owner_id === message.user.id) {
      this.bot.logger?.debug(
        `Skipping kick for room owner ${message.user.username} in room ${message.room_id}`,
      );
      return;
    }

    try {
      await this.bot.chat.kickMember(message.user.id, message.room_id);

      // Reset user violations after kick
      this.resetUserViolations(message.room_id, message.user.id);

      this.bot.logger?.info(
        `Kicked user ${message.user.username} (ID: ${message.user.id}) from room ${message.room_id} due to excessive violations`,
      );
    } catch (error) {
      this.bot.logger?.error(
        `Failed to kick user ${message.user.username} from room ${message.room_id}:`,
        error,
      );
    }
  }

  /**
   * Builds an appropriate response message based on violations.
   * If escalation thresholds are met, it will generate a warning message instead of a standard response.
   *
   * @param message The original message that triggered the violation.
   * @param userViolations The current violation levels and history for the user.
   * @returns A Content object containing the response message, or null if no response should be sent.
   */
  private buildResponse(
    message: Message,
    userViolations: UserViolations,
  ): Content | null {
    const content = new Content("chat-message");
    let responseText = "";

    // Check for escalation if enabled
    if (
      this.config.escalation.enabled &&
      userViolations.warningCount >= this.config.escalation.warningThreshold
    ) {
      if (
        userViolations.warningCount >=
          this.config.escalation.kickThreshold - 1 &&
        this.bot.chat.isRoomOwner(message.room_id)
      ) {
        responseText = `@${message.user.username} FINAL WARNING! Next violation will result in removal from the room.`;
      } else {
        responseText = `@${message.user.username} Please stop violating chat guidelines. Continued violations may lead to removal from the room.`;
      }
    } else {
      // Select response based on violation type
      const violationType = userViolations.violations[0]; // Take the first violation

      switch (violationType) {
        case ViolationType.PROFANITY:
          responseText = this.getRandomResponse(
            this.config.profanity.responses,
          );
          break;
        case ViolationType.CAPS:
          responseText = this.getRandomResponse(this.config.caps.responses);
          break;
        case ViolationType.SPAM:
          responseText = this.getRandomResponse(this.config.spam.responses);
          break;
        default:
          responseText = `@${message.user.username} Please follow chat guidelines.`;
      }

      responseText = `@${message.user.username} ${responseText
        .replace("@" + message.user.username, "")
        .trim()}`;
    }

    content.insertText(responseText);
    return content;
  }

  /**
   * Gets a random response from the provided array.
   *
   * @param responses An array of response strings to choose from.
   * @returns A randomly selected response string.
   */
  private getRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Applies penalty reduction after a response is sent.
   * This helps to prevent users from being permanently penalized for past violations and encourages better behavior over time.
   *
   * @param userViolations The current violation levels for the user to apply reduction to.
   */
  private applyPenaltyReduction(userViolations: UserViolations): void {
    // Reduce levels after issuing a warning
    userViolations.profanityLevel = Math.max(
      0,
      userViolations.profanityLevel - 1.0,
    );
    userViolations.capsLevel = Math.max(0, userViolations.capsLevel - 1.0);
    userViolations.spamLevel = Math.max(0, userViolations.spamLevel - 1.5);
  }

  /**
   * Gets violation statistics for a specific user in a room.
   * Useful for monitoring user behavior or implementing custom responses based on violation history.
   *
   * @param roomId The ID of the room to check.
   * @param userId The ID of the user to check.
   * @returns An object containing the user's violation levels and history, or null if no data is found.
   */
  getViolationStats(roomId: number, userId: number): UserViolations | null {
    return this.policerMap[roomId]?.[userId] || null;
  }

  /**
   * Resets violation data for a specific user in a room.
   * This can be used after a user has been kicked or if an administrator wants to give a user a clean slate.
   *
   * @param roomId The ID of the room to reset.
   * @param userId The ID of the user to reset.
   */
  resetUserViolations(roomId: number, userId: number): void {
    if (this.policerMap[roomId]?.[userId]) {
      delete this.policerMap[roomId][userId];
      this.bot.logger?.info(
        `Reset violations for user ${userId} in room ${roomId}`,
      );
    }
  }

  /**
   * Gets overall statistics about the policer's activity.
   * Useful for monitoring the effectiveness of the policer and identifying trends in user behavior.
   *
   * @returns An object containing the total number of users, total number of rooms, and the number of active violations.
   */
  getStats(): {
    totalUsers: number;
    totalRooms: number;
    activeViolations: number;
  } {
    let totalUsers = 0;
    let activeViolations = 0;
    const totalRooms = Object.keys(this.policerMap).length;

    for (const roomId in this.policerMap) {
      const room = this.policerMap[roomId];
      totalUsers += Object.keys(room).length;

      for (const userId in room) {
        const user = room[userId];
        if (
          user.capsLevel > 0 ||
          user.profanityLevel > 0 ||
          user.spamLevel > 0
        ) {
          activeViolations++;
        }
      }
    }

    return { totalUsers, totalRooms, activeViolations };
  }
}
