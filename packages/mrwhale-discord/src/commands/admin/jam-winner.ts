import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Message,
  PermissionFlagsBits,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "jamwinner",
      description: "Select and announce the winner of the current or most recent jam. (Moderator only)",
      type: "admin",
      usage: "<prefix>jamwinner",
      guildOnly: true,
      callerPermissions: [PermissionFlagsBits.ManageGuild],
    });
    this.slashCommandData
      .addIntegerOption((o) =>
        o
          .setName("submission_id")
          .setDescription("The submission ID to declare as winner (see /jaminfo for IDs)")
          .setRequired(true)
      )
      .addIntegerOption((o) =>
        o
          .setName("jam_id")
          .setDescription("The jam ID (defaults to current active or last closed jam)")
          .setRequired(false)
      );
    this.slashCommandData.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);
  }

  async action(message: Message): Promise<Message> {
    return message.reply("Please use the slash command `/jamwinner` to select a winner.");
  }

  async slashCommandAction(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const submissionId = interaction.options.getInteger("submission_id", true);
    const jamId = interaction.options.getInteger("jam_id") ?? null;

    // Resolve the jam to use
    let resolvedJamId: number;
    if (jamId !== null) {
      resolvedJamId = jamId;
    } else {
      const currentJam = await this.botClient.jamManager.getCurrentJam(interaction.guildId!);
      if (!currentJam) {
        const pastJams = await this.botClient.jamManager.getPastJams(interaction.guildId!, 1);
        if (pastJams.length === 0) {
          await interaction.editReply("❌ No jams found for this server.");
          return;
        }
        resolvedJamId = pastJams[0].id;
      } else {
        resolvedJamId = currentJam.id;
      }
    }

    const result = await this.botClient.jamManager.setWinner(
      interaction.guildId!,
      resolvedJamId,
      submissionId
    );

    if (!result.success) {
      await interaction.editReply(`❌ ${result.error}`);
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle("✅ Winner Selected!")
      .setDescription(
        `**${result.submission!.gameTitle}** by <@${result.submission!.userId}> has been declared the winner!\n\n` +
        `The winner announcement has been posted in the jam channel.`
      );

    await interaction.editReply({ embeds: [embed] });
  }
}
