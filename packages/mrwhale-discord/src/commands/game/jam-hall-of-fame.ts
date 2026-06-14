import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import { JamSubmission } from "../../database/models/jam-submission";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "jamhalloffame",
      description: "View the Hall of Fame for past weekly game jam winners.",
      type: "game",
      usage: "<prefix>jamhalloffame",
      aliases: ["jamhof", "jamwinners"],
      guildOnly: true,
    });
  }

  async action(message: Message): Promise<Message> {
    const response = await this.buildResponse(message.guildId!);
    return message.reply(response);
  }

  async slashCommandAction(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    const response = await this.buildResponse(interaction.guildId!);
    await interaction.editReply(response);
  }

  private async buildResponse(guildId: string) {
    const pastJams = await this.botClient.jamManager.getPastJams(guildId, 10);
    const closedWithWinner = pastJams.filter((j) => j.winnerSubmissionId !== null);

    if (closedWithWinner.length === 0) {
      return {
        embeds: [
          new EmbedBuilder()
            .setColor(0x95a5a6)
            .setTitle("🏆 Hall of Fame")
            .setDescription("No winners have been crowned yet. Stay tuned!")
            .setTimestamp(),
        ],
      };
    }

    // Fetch winner submissions in bulk
    const winnerIds = closedWithWinner.map((j) => j.winnerSubmissionId!);
    const winnerSubmissions = await JamSubmission.findAll({
      where: { id: winnerIds },
    });
    const submissionMap = new Map(winnerSubmissions.map((s) => [s.id, s]));

    const lines = closedWithWinner.map((jam) => {
      const sub = submissionMap.get(jam.winnerSubmissionId!);
      if (!sub) return `**Jam #${jam.weekNumber}** — *${jam.theme}* — No winner recorded`;
      return `**Jam #${jam.weekNumber}** — *${jam.theme}*\n🏆 [${sub.gameTitle}](${sub.gameUrl}) by <@${sub.userId}>`;
    });

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle("🏆 Mr. Whale's Hall of Fame")
      .setDescription(lines.join("\n\n"))
      .setFooter({ text: "Honoured by the squid council 🦑" })
      .setTimestamp();

    return { embeds: [embed] };
  }
}
