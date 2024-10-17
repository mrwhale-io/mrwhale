import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  Interaction,
  InteractionResponse,
  Message,
} from "discord.js";

import { Bait, Fish, FishingRod, catchFish } from "@mrwhale-io/core";
import { DiscordBotClient } from "../discord-bot-client";
import { delay } from "../../util/delay-helpers";
import { getEquippedFishingRod } from "../../database/services/fishing-rods";
import { updateOrCreateUserItem } from "../../database/services/user-inventory";
import { logFishCaught } from "../../database/services/fish-caught";
import { NoFishError } from "../../types/errors/no-fish-error";
import { NoAttemptsLeftError } from "../../types/errors/no-attempts-left-error";
import { consumeBait, getEquippedBait } from "../../database/services/bait";
import { checkAndAwardFishingAchievements } from "../../database/services/achievements";
import { CatchResult } from "../../types/fishing/catch-result";
import { LevelManager } from "./level-manager";
import { extractUserAndGuildId } from "../../util/extract-user-and-guild-id";
import { FishSpawner } from "../modules/fish-spawner";
import { FishingAttemptTracker } from "../modules/fishing-attempt-tracker";
import { getCatchableFish } from "../../util/get-catchable-fish";
import { createEmbed } from "../../util/embed/create-embed";
import { getCaughtFishEmbed } from "../../util/embed/fish-caught-embed-helpers";
import { createCatchButtons } from "../../util/button/catch-buttons-helpers";
import { sendReply } from "../../util/send-reply";
import { createCatchResult } from "../../util/create-catch-result";

const BASE_NO_CATCH_PROBABILITY = 200;

/**
 * Manages the fishing functionality in the Discord bot.
 * Handles spawning fish, catching fish, updating user attempts, and awarding achievements.
 */
export class FishingManager {
  private activeFishers: Set<string> = new Set();

  constructor(
    private bot: DiscordBotClient,
    private fishSpawner: FishSpawner,
    private fishingAttemptTracker: FishingAttemptTracker,
    private levelManager: LevelManager
  ) {}

  /**
   * Initiates the fishing process for a user in a guild. If the user is already fishing,
   * it sends a message indicating that they must wait until the current fishing attempt is complete.
   * Otherwise, it proceeds with the fishing process, sends a message indicating the fishing is in progress,
   * and then handles the result of the fishing attempt.
   *
   * @param interactionOrMessage The interaction or message object from the Discord API, containing details of the user and guild.
   * @returns A promise that resolves to the sent message containing the fish caught embed and catch buttons.
   * @throws Will throw an error if an unexpected error occurs during the process.
   */
  async catchFish(
    interactionOrMessage:
      | ChatInputCommandInteraction
      | ButtonInteraction
      | Message
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    const { userId, guildId } = extractUserAndGuildId(interactionOrMessage);
    let messageResponse: Message;

    const activeFisherKey = `${guildId}-${userId}`;

    // Check if the user is already in the process of fishing.
    if (this.isUserFishing(activeFisherKey)) {
      const alreadyFishingEmbed = createEmbed(
        "You are already fishing. Please wait until your current fishing attempt is complete."
      );
      return sendReply(interactionOrMessage, alreadyFishingEmbed, true);
    }

    // Mark the user as currently fishing
    // This is to prevent more than one fishing action to occur at the same time
    this.activeFishers.add(activeFisherKey);

    try {
      messageResponse = await this.sendFishingInProgressMessage(
        interactionOrMessage
      );
      const catchResult = await this.processFishCatch(interactionOrMessage);
      await this.editFishingResultMessage(
        messageResponse,
        interactionOrMessage,
        catchResult
      );
    } catch (error) {
      this.handleFishingError(error, messageResponse);
    } finally {
      this.activeFishers.delete(activeFisherKey);
    }
  }

  private async sendFishingInProgressMessage(
    interactionOrMessage:
      | ChatInputCommandInteraction
      | ButtonInteraction
      | Message
  ): Promise<Message> {
    const inProgressMessage = createEmbed(
      `🎣 <@${interactionOrMessage.member.user.id}> is fishing...`
    );
    return sendReply(interactionOrMessage, inProgressMessage);
  }

  private async editFishingResultMessage(
    messageResponse: Message,
    interactionOrMessage:
      | ChatInputCommandInteraction
      | ButtonInteraction
      | Message,
    catchResult: CatchResult
  ): Promise<void> {
    const fishCaughtEmbed = await getCaughtFishEmbed({
      fishCaught: catchResult.fishCaught,
      interaction: interactionOrMessage,
      fishingRodUsed: catchResult.fishingRodUsed,
      baitUsed: catchResult.baitUsed,
      achievements: catchResult.achievements,
      botClient: this.bot,
    });
    const catchButtons = createCatchButtons(interactionOrMessage, this.bot);

    await messageResponse.edit({
      embeds: [fishCaughtEmbed],
      components: catchButtons ? [catchButtons] : [],
    });
  }

  /**
   * Processes the catch of a fish by a user.
   *
   * @param interactionOrMessage The interaction or message triggering the fish catch.
   * @returns A promise that resolves to a CatchResult object.
   * @throws NoFishError if there are no fish available to catch in the guild.
   * @throws NoAttemptsLeftError if the user has no remaining attempts to catch fish.
   */
  private async processFishCatch(
    interactionOrMessage:
      | ChatInputCommandInteraction
      | ButtonInteraction
      | Message
  ): Promise<CatchResult> {
    const { userId, guildId } = extractUserAndGuildId(interactionOrMessage);

    // Check if there are any fish available to catch in the guild
    if (!this.fishSpawner.hasGuildFish(guildId)) {
      throw new NoFishError();
    }

    const fishingRodEquipped = await getEquippedFishingRod(userId, guildId);

    // Check if the user has any remaining attempts to catch fish
    if (
      !this.fishingAttemptTracker.hasRemainingAttempts(
        userId,
        guildId,
        fishingRodEquipped
      )
    ) {
      throw new NoAttemptsLeftError();
    }

    const baitEquipped = await getEquippedBait(userId, guildId);
    const fishCaught = await this.attemptFishCatch(
      userId,
      guildId,
      fishingRodEquipped,
      baitEquipped
    );

    if (!fishCaught) {
      this.fishingAttemptTracker.updateAttempts(userId, guildId);
      return createCatchResult(null, [], baitEquipped, fishingRodEquipped);
    }

    // Handle the caught fish (e.g., add to inventory, update guild state)
    await this.handleFishCaught(interactionOrMessage, fishCaught);

    // Check whether the user has earned any achievements
    const achievements = await checkAndAwardFishingAchievements(
      guildId,
      userId,
      fishCaught,
      this.levelManager
    );

    return createCatchResult(
      fishCaught,
      achievements,
      baitEquipped,
      fishingRodEquipped
    );
  }

  /**
   * Attempts to catch a fish using the provided fishing rod and bait.
   *
   * @param userId The ID of the user attempting to catch the fish.
   * @param guildId The ID of the guild where the fishing is taking place.
   * @param fishingRod The fishing rod being used for the catch.
   * @param bait The bait being used for the catch.
   * @returns A promise that resolves to the caught fish.
   */
  private async attemptFishCatch(
    userId: string,
    guildId: string,
    fishingRod: FishingRod,
    bait: Bait
  ): Promise<Fish> {
    const allGuildFish = this.fishSpawner.getGuildFish(guildId);
    const catchableFish = getCatchableFish(allGuildFish);
    const fishCaught = catchFish(
      catchableFish,
      fishingRod,
      bait,
      BASE_NO_CATCH_PROBABILITY
    );

    // Use bait equipped from the user's inventory.
    await consumeBait(userId, guildId, bait.id);

    // Wait for the delay specified by the fishing rod
    await delay(fishingRod.delay);

    return fishCaught;
  }

  private async handleFishCaught(
    messageOrInteraction: Message | Interaction,
    fishCaught: Fish
  ): Promise<void> {
    const { userId, guildId } = extractUserAndGuildId(messageOrInteraction);
    // Find the type of fish caught in the guild and decrement it's quantity.
    // When the quantity is zero we delete the fish from the guild.
    const allGuildFish = this.fishSpawner.getGuildFish(guildId);
    const guildFish = allGuildFish[fishCaught.name];
    if (guildFish) {
      guildFish.quantity--;
      if (guildFish.quantity <= 0) {
        delete allGuildFish[fishCaught.name];
      }
    }

    // Add this fish to the user's inventory.
    await updateOrCreateUserItem({
      userId,
      guildId,
      itemId: fishCaught.id,
      itemType: "Fish",
    });

    await logFishCaught(userId, guildId, fishCaught.id, fishCaught.rarity);

    // Decrement the number of attempts the user has left.
    this.fishingAttemptTracker.updateAttempts(userId, guildId);

    // If we have caught all the fish in the guild we send an announcement
    if (!this.fishSpawner.hasGuildFish(guildId)) {
      this.fishSpawner.despawnFishInGuild(guildId);
    }
  }

  private async handleFishingError(
    error: Error,
    messageResponse: Message
  ): Promise<void> {
    if (error instanceof NoFishError || error instanceof NoAttemptsLeftError) {
      const nothingCaughtEmbed = createEmbed(error.message);
      `🎣 ${error.message}`;
      await messageResponse.edit({
        embeds: [nothingCaughtEmbed],
      });
    } else {
      this.bot.logger.error("Error catching fish:", error);
      throw error;
    }
  }

  private isUserFishing(activeFisherKey: string): boolean {
    return this.activeFishers.has(activeFisherKey);
  }
}
