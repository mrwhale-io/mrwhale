import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "voteleave",
      description:
        "Vote to make the bot leave the group chat. Requires 3 votes or majority of active members.",
      type: "utility",
      usage: "<prefix>voteleave",
      examples: ["<prefix>voteleave"],
      groupOnly: true,
      cooldown: 10000, // 10 second cooldown per user
    });
  }

  async action(message: Message): Promise<Message> {
    const room = this.botClient.chat.activeRooms.get(message.room_id);
    if (!room) {
      return message.reply("❌ Error accessing room information.");
    }

    // Only allow voting when bot is the owner (otherwise use regular leave command)
    if (room.owner_id !== this.botClient.client.userId) {
      const prefix = await this.botClient.getPrefix(message.room_id);
      return message.reply(
        `❌ The bot is not the room owner. Room owners can use \`${prefix}leave\` instead.`,
      );
    }

    const userId = message.user.id;
    const result = await this.botClient.voteLeaveManager.addLeaveVote(
      message.room_id,
      userId,
      message.user.username,
    );

    switch (result.status) {
      case "already_voted":
        return message.reply("🗳️ You have already voted to remove the bot.");

      case "vote_added":
        {
          const remaining = result.votesNeeded - result.currentVotes;
          if (remaining > 0) {
            return message.reply(
              `🗳️ Vote recorded! **${result.currentVotes}/${
                result.votesNeeded
              }** votes needed. ${remaining} more vote${
                remaining === 1 ? "" : "s"
              } required to remove the bot.`,
            );
          }
        }
        break;

      case "executed":
        return message.reply(
          "🗳️ Vote passed! The bot will now leave the group. Goodbye! 👋",
        );

      default:
        return message.reply("❌ Error processing vote. Please try again.");
    }
  }
}
