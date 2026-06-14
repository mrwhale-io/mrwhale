import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Message,
  PermissionFlagsBits,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";

const DEFAULT_TEST_DURATION_HOURS = 168;

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "startjam",
      description:
        "Manually start a weekly game jam now (useful for testing or missed Sundays).",
      type: "admin",
      usage: "<prefix>startjam [duration-hours]",
      guildOnly: true,
      callerPermissions: [PermissionFlagsBits.ManageGuild],
    });

    this.slashCommandData
      .addIntegerOption((option) =>
        option
          .setName("duration_hours")
          .setDescription(
            "Optional jam duration in hours (default 168 / 7 days, useful for testing)",
          )
          .setRequired(false)
          .setMinValue(1)
          .setMaxValue(24 * 30),
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);
  }

  async action(message: Message): Promise<Message> {
    return message.reply(
      "Please use the slash command `/startjam` (admin only).",
    );
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction,
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const durationHours =
      interaction.options.getInteger("duration_hours") ??
      DEFAULT_TEST_DURATION_HOURS;

    const result = await this.botClient.jamManager.createJamNow(
      interaction.guildId!,
      durationHours,
    );

    if (!result.success || !result.jam) {
      await interaction.editReply(`❌ ${result.error}`);
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle("✅ Jam Started")
      .setDescription(
        `Started **Jam #${result.jam.weekNumber}** with theme **${result.jam.theme}**.`,
      )
      .addFields(
        {
          name: "⏳ Duration",
          value: `${durationHours} hour${durationHours === 1 ? "" : "s"}`,
          inline: true,
        },
        {
          name: "📅 Ends",
          value: `<t:${Math.floor(result.jam.endDate.getTime() / 1000)}:F>`,
          inline: true,
        },
      )
      .setFooter({
        text: "Automatic scheduling still runs on Sundays at 12:00 UTC.",
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
}
