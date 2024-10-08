import { ChatInputCommandInteraction, Message } from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import { activityNames } from "../../types/activities/activity-names";
import { createEmbed } from "../../util/embed/create-embed";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "activities",
      description: "Displays all scheduled activities for the current guild.",
      type: "utility",
      usage: "<prefix>activities",
      guildOnly: true,
    });
  }

  async action(message: Message, args?: unknown[]): Promise<void> {}

  async slashCommandAction(interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId;

    if (!guildId) {
      return interaction.reply("This command must be used within a guild.");
    }

    const scheduledActivities = this.botClient.activityScheduler.activities.filter(
      (activity) => activity.guildId === guildId
    );

    if (scheduledActivities.length === 0) {
      return interaction.reply(
        "There are no scheduled activities for this guild."
      );
    }

    const embed = createEmbed(
      "Here's what's happening in this guild:"
    ).setTitle("📅 **Scheduled Activities**");

    const currentTime = Date.now();
    const currentActivity = scheduledActivities.find(
      (activity) =>
        activity.startTime <= currentTime && activity.endTime >= currentTime
    );
    const nextActivity = scheduledActivities.find(
      (activity) => activity.startTime > currentTime
    );

    // Display Current Activity
    if (currentActivity) {
      embed.addFields({
        name: "🔄 **Current Activity**",
        value: `**Activity**: ${
          activityNames[currentActivity.name] || currentActivity.name
        }\n**Ends**: <t:${Math.floor(currentActivity.endTime / 1000)}:R>`,
        inline: false,
      });
    } else {
      embed.addFields({
        name: "🔄 **Current Activity**",
        value: "No activity is currently running.",
        inline: false,
      });
    }

    // Display Next Activity
    if (nextActivity) {
      embed.addFields({
        name: "⏳ **Next Activity**",
        value: `**Activity**: ${
          activityNames[nextActivity.name] || nextActivity.name
        }\n**Starts**: <t:${Math.floor(nextActivity.startTime / 1000)}:R>`,
        inline: false,
      });
    } else {
      embed.addFields({
        name: "⏳ **Next Activity**",
        value: "No upcoming activity is scheduled.",
        inline: false,
      });
    }

    // Display all activities
    const activityList = scheduledActivities
      .map((activity) => {
        const humanFriendlyName = activityNames[activity.name] || activity.name;
        return `**${humanFriendlyName}**\n🕒 Starts: <t:${Math.floor(
          activity.startTime / 1000
        )}:R>\n`;
      })
      .join("\n");

    embed.addFields({
      name: "📅 **All Scheduled Activities**",
      value: activityList,
      inline: false,
    });

    return interaction.reply({ embeds: [embed] });
  }
}
