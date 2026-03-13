import * as os from "os";

import { TimeUtilities, InfoBuilder } from "@mrwhale-io/core";
import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { version } from "../../../package.json";

const FRACTIONAL_DIGITS = 2;
const MEM_UNIT = 1024;

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "info",
      description: "Get comprehensive bot information and statistics.",
      type: "utility",
      usage: "<prefix>info",
      aliases: ["uptime", "stats", "version", "status"],
      cooldown: 3000,
    });
  }

  async action(message: Message): Promise<Message> {
    try {
      // Memory and performance stats
      const memUsage = process.memoryUsage();
      const heapUsed = memUsage.heapUsed / MEM_UNIT / MEM_UNIT;
      const heapTotal = memUsage.heapTotal / MEM_UNIT / MEM_UNIT;
      const rss = memUsage.rss / MEM_UNIT / MEM_UNIT;

      // System information
      const loadAvg = os.loadavg()[0].toFixed(2);

      // Bot-specific stats
      const groupIds =
        this.botClient.chat.groupIds ||
        this.botClient.chat.groups.map((group) => group.id);
      const activeRooms = this.botClient.chat.activeRooms.size();
      const connectedSince = new Date(Date.now() - this.botClient.uptime);

      // Get manager statistics if available
      let policerStats = null;
      let replyStats = null;

      try {
        policerStats = this.botClient.policer?.getStats?.();
        replyStats = this.botClient.replyManager?.getStats?.();
      } catch (error) {
        // Ignore if managers don't have stats methods
      }

      const builder = new InfoBuilder()
        .setFormat("codeblock")
        .addSection("Mr. Whale Bot Information", "🤖")
        .addDivider()
        .addSection("Core Stats", "📊")
        .addField("Version", version)
        .addTimestamp("Connected since", connectedSince, "both")
        .addField("Uptime", `${TimeUtilities.convertMs(this.botClient.uptime)}`)
        .addDivider()
        .addSection("Chat & Social", "💬")
        .addField("Group chats", groupIds.length.toString())
        .addField("Active rooms", activeRooms.toString())
        .addField("Friends", this.botClient.friendsList.count.toString())
        .addField("Commands loaded", this.botClient.commands.size.toString())
        .addDivider()
        .addSection("Performance", "⚡")
        .addProgressBar("Memory (Heap)", heapUsed, heapTotal, "MB")
        .addField("Memory (RSS)", `${rss.toFixed(FRACTIONAL_DIGITS)}MB`)
        .addField("CPU Load", loadAvg)
        .addDivider()
        .addSection("Features", "🔧")
        .addConditional(this.botClient.cleverbot !== null, (b) =>
          b.addField(
            "Cleverbot",
            this.botClient.cleverbot ? "✅ Enabled" : "❌ Disabled",
          ),
        )
        .addConditional(policerStats !== null, (b) =>
          b.addField(
            "Chat Moderation",
            `✅ Active (${policerStats.totalUsers} users tracked)`,
          ),
        )
        .addConditional(policerStats === null, (b) =>
          b.addField("Chat Moderation", "❓ Unknown"),
        )
        .addConditional(replyStats !== null, (b) =>
          b.addField(
            "Auto Replies",
            `✅ Active (${replyStats.globalResponses}/min)`,
          ),
        )
        .addConditional(replyStats === null, (b) =>
          b.addField("Auto Replies", "❓ Unknown"),
        )
        .addDivider()
        .addSection("Links", "ℹ️")
        .addLink(
          "Discord Support",
          "Join Server",
          "https://discord.com/invite/wjBnkR4AUZ",
        )
        .addLink(
          "Game Jolt Profile",
          "@mrwhale",
          "https://gamejolt.com/@mrwhale",
        );

      return message.reply(builder.build());
    } catch (error) {
      this.botClient.logger?.error("Error in info command:", error);

      // Enhanced fallback using InfoBuilder
      const memoryUsage = process.memoryUsage().heapUsed / MEM_UNIT / MEM_UNIT;
      const groupIds =
        this.botClient.chat.groupIds ||
        this.botClient.chat.groups.map((group) => group.id);

      const fallbackBuilder = new InfoBuilder()
        .addSection("Mr. Whale Bot (Limited Info)", "🤖")
        .addField("Status", "⚠️ Error occurred - showing basic info")
        .addDivider()
        .addField("Version", version)
        .addField("Group chats", groupIds.length.toString())
        .addField("Friends", this.botClient.friendsList.count.toString())
        .addField("Commands", this.botClient.commands.size.toString())
        .addField("Memory", `${memoryUsage.toFixed(FRACTIONAL_DIGITS)} MB`)
        .addField(
          "Uptime",
          `${TimeUtilities.convertMs(this.botClient.uptime)}`,
        );

      return message.reply(fallbackBuilder.build());
    }
  }
}
