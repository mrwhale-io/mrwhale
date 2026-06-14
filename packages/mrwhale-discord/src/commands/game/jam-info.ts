import { ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import { EMBED_COLOR } from "../../constants";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "jaminfo",
      description: "View the current weekly game jam and its submissions.",
      type: "game",
      usage: "<prefix>jaminfo",
      guildOnly: true,
    });
  }

  async action(message: Message): Promise<Message> {
    const response = await this.buildResponse(message.guildId!);
    return message.reply(response);
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction,
  ): Promise<void> {
    await interaction.deferReply();
    const response = await this.buildResponse(interaction.guildId!);
    await interaction.editReply(response);
  }

  private async buildResponse(guildId: string) {
    const jam = await this.botClient.jamManager.getCurrentJam(guildId);

    if (!jam) {
      return {
        embeds: [
          new EmbedBuilder()
            .setColor(0x95a5a6)
            .setTitle("No Active Game Jam")
            .setDescription(
              "There is no game jam running right now.\n\n" +
                "Automatic jams start every Sunday at 12:00 UTC.\n" +
                "A moderator can configure jams with `/setjamchannel` and start one immediately with `/startjam`.",
            )
            .setTimestamp(),
        ],
      };
    }

    const submissions = await this.botClient.jamManager.getSubmissions(jam.id);
    const daysLeft = Math.max(
      0,
      Math.ceil((jam.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    );

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle(`Weekly Jam #${jam.weekNumber}`)
      .setDescription(`**🎯 Theme: ${jam.theme}**`)
      .addFields(
        {
          name: "⏳ Ends",
          value: `<t:${Math.floor(
            jam.endDate.getTime() / 1000,
          )}:R> (<t:${Math.floor(jam.endDate.getTime() / 1000)}:F>)`,
        },
        {
          name: "📊 Submissions",
          value:
            submissions.length > 0
              ? submissions
                  .slice(0, 10)
                  .map(
                    (s, i) =>
                      `${i + 1}. **[${s.gameTitle}](${s.gameUrl})** by <@${
                        s.userId
                      }>`,
                  )
                  .join("\n") +
                (submissions.length > 10
                  ? `\n*...and ${submissions.length - 10} more*`
                  : "")
              : "No submissions yet — be the first! Use `/jamsubmit`",
        },
      )
      .setFooter({
        text:
          daysLeft > 0
            ? `${daysLeft} day${
                daysLeft !== 1 ? "s" : ""
              } remaining • Submit with /jamsubmit`
            : "Submissions have closed",
      })
      .setTimestamp();

    return { embeds: [embed] };
  }
}
