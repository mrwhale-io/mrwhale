import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Message,
  PermissionFlagsBits,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import { Settings } from "../../types/settings";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "setjamchannel",
      description: "Set the channel used for weekly game jam announcements. (Moderator only)",
      type: "admin",
      usage: "<prefix>setjamchannel",
      guildOnly: true,
      callerPermissions: [PermissionFlagsBits.ManageGuild],
    });
    this.slashCommandData
      .addChannelOption((o) =>
        o
          .setName("channel")
          .setDescription("The channel to use for jam announcements and daily prompts")
          .setRequired(true)
      )
      .addBooleanOption((o) =>
        o
          .setName("enable")
          .setDescription("Enable or disable weekly jams for this server (default: true)")
          .setRequired(false)
      );
    this.slashCommandData.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);
  }

  async action(message: Message): Promise<Message> {
    return message.reply("Please use the slash command `/setjamchannel` to configure the jam channel.");
  }

  async slashCommandAction(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.options.getChannel("channel", true);
    const enable = interaction.options.getBoolean("enable") ?? true;

    const settings = this.botClient.guildSettings.get(interaction.guildId!);
    if (!settings) {
      await interaction.editReply("❌ Guild settings not found. Please try again.");
      return;
    }

    settings.set(Settings.JamChannel, channel.id);
    settings.set(Settings.WeeklyJam, enable);

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle("✅ Jam Settings Updated")
      .addFields(
        { name: "📢 Jam Channel", value: `<#${channel.id}>`, inline: true },
        { name: "⚙️ Weekly Jams", value: enable ? "✅ Enabled" : "❌ Disabled", inline: true }
      )
      .setDescription(
        enable
          ? "Weekly jams will auto-start every Sunday at 12:00 UTC. Use `/startjam` any time if you want to test now or recover a missed Sunday."
          : "Weekly jams have been disabled for this server."
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
}
