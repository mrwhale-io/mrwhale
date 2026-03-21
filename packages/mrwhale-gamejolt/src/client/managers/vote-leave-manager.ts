import { GameJoltBotClient } from "../gamejolt-bot-client";

/**
 * Manages the voting system for users to vote to remove the bot from a group chat when it's the room owner.
 *
 * This allows users to democratically decide to remove the bot if they don't want it in the chat anymore,
 */
export class VoteLeaveManager {
  /**
   * Vote tracking for leave requests in group chats.
   * Maps room IDs to their active vote data including voters and timestamps.
   */
  readonly leaveVotes: Map<
    number,
    {
      votes: Map<number, string>; // userId -> username
      startTime: number;
      timeout: NodeJS.Timeout;
    }
  >;

  constructor(private bot: GameJoltBotClient) {
    this.leaveVotes = new Map();
  }

  /**
   * Adds a vote to remove the bot from a group chat.
   *
   * Implements a voting system where multiple users can vote to remove the bot
   * when it's the room owner. Requires either 3 votes minimum or majority of
   * active members (whichever is higher).
   *
   * @param roomId - The room where the vote is being cast
   * @param userId - The ID of the user casting the vote
   * @param username - The username of the voter (for logging)
   * @returns Object describing the vote result and current status
   */
  async addLeaveVote(
    roomId: number,
    userId: number,
    username: string,
  ): Promise<{
    status: "already_voted" | "vote_added" | "executed";
    currentVotes: number;
    votesNeeded: number;
  }> {
    const VOTE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
    const MIN_VOTES = 3;

    // Get or create vote tracking for this room
    let voteData = this.leaveVotes.get(roomId);
    if (!voteData) {
      voteData = {
        votes: new Map(),
        startTime: Date.now(),
        timeout: setTimeout(() => {
          this.clearLeaveVotes(roomId);
          this.bot.logger?.info(`Leave vote expired for room ${roomId}`);
        }, VOTE_TIMEOUT),
      };
      this.leaveVotes.set(roomId, voteData);
      this.bot.logger?.info(`Started new leave vote for room ${roomId}`);
    }

    // Check if user already voted
    if (voteData.votes.has(userId)) {
      return {
        status: "already_voted",
        currentVotes: voteData.votes.size,
        votesNeeded: this.calculateVotesNeeded(roomId, MIN_VOTES),
      };
    }

    // Add the vote
    voteData.votes.set(userId, username);
    const currentVotes = voteData.votes.size;
    const votesNeeded = this.calculateVotesNeeded(roomId, MIN_VOTES);

    this.bot.logger?.info(
      `User ${username} (${userId}) voted to remove bot from room ${roomId}. Votes: ${currentVotes}/${votesNeeded}`,
    );

    // Check if we have enough votes
    if (currentVotes >= votesNeeded) {
      // Execute the leave
      this.clearLeaveVotes(roomId);

      this.bot.logger?.info(
        `Leave vote passed for room ${roomId} with ${currentVotes} votes`,
      );

      // Leave the room
      setTimeout(() => {
        try {
          this.bot.chat.userChannel?.push("group_leave", {
            room_id: roomId,
          });
        } catch (error) {
          this.bot.logger?.error(`Failed to leave room ${roomId}:`, error);
        }
      }, 2000); // Give time for the response message

      return {
        status: "executed",
        currentVotes,
        votesNeeded,
      };
    }

    return {
      status: "vote_added",
      currentVotes,
      votesNeeded,
    };
  }

  /**
   * Clears leave votes for a specific room.
   *
   * @param roomId - The room to clear votes for
   */
  clearLeaveVotes(roomId: number): void {
    const voteData = this.leaveVotes.get(roomId);
    if (voteData) {
      clearTimeout(voteData.timeout);
      this.leaveVotes.delete(roomId);
    }
  }

  /**
   * Calculates the number of votes needed to remove the bot.
   * Uses either minimum votes or majority of active members, whichever is higher.
   *
   * @param roomId - The room to calculate votes for
   * @param minVotes - Minimum number of votes required
   * @returns Number of votes needed
   */
  private calculateVotesNeeded(roomId: number, minVotes: number): number {
    const room = this.bot.chat.activeRooms.get(roomId);
    if (!room) {
      return minVotes;
    }

    // Get number of non-bot members
    const memberCount = room.members.length - 1; // Exclude the bot
    console.log(memberCount)
    const majorityVotes = Math.ceil(memberCount / 2);

    return Math.max(minVotes, majorityVotes);
  }
}
