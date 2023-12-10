import { ChatInputCommandInteraction, Message } from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import {
  PageResult,
  getEmbedWithPaginatorButtons,
} from "../../util/paginator-buttons";
import {
  createLeaderboardTable,
  getGlobalScores,
  getGuildScores,
} from "../../util/leaderboard";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "leaderboard",
      description: "List the top players in the server.",
      type: "level",
      usage: "<prefix>leaderboard",
      examples: ["<prefix>leaderboard"],
      guildOnly: true,
      cooldown: 5000,
    });
    this.slashCommandData.addBooleanOption((option) =>
      option
        .setName("global")
        .setDescription("Fetch the global leaderboard.")
        .setRequired(false)
    );
  }

  async action(message: Message, [command]: [string]): Promise<Message> {
    try {
      const page = 1;
      const isGlobal = command && command.toLowerCase().trim() === "global";
      if (isGlobal) {
        const mappedGlobalScores = await getGlobalScores(message, page);
        const embed = await createLeaderboardTable(
          mappedGlobalScores,
          page,
          "Global leaderboard"
        );
        return message.reply({
          embeds: [embed],
          allowedMentions: { users: [] },
        });
      }
      const mappedGuildScores = await getGuildScores(message, page);
      const embed = await createLeaderboardTable(
        mappedGuildScores,
        page,
        `${message.guild.name} leaderboard`
      );
      return message.reply({
        embeds: [embed],
        allowedMentions: { users: [] },
      });
    } catch {
      return message.reply("Could not fetch leaderboard.");
    }
  }

  async slashCommandAction(interaction: ChatInputCommandInteraction) {
    try {
      const global = interaction.options.getBoolean("global") || false;
      if (global) {
        return this.getGlobalHighScoreEmbed(interaction);
      }
      return await this.getGuildHighScoreEmbed(interaction);
    } catch {
      return interaction.reply("Could not fetch leaderboard.");
    }
  }

  private async getGlobalHighScoreEmbed(
    interaction: ChatInputCommandInteraction
  ) {
    const fetchGlobalScoresEmbed = async (
      page: number
    ): Promise<PageResult> => {
      const mappedGlobalScores = await getGlobalScores(interaction, page);
      const embed = await createLeaderboardTable(
        mappedGlobalScores,
        page,
        "Global leaderboard"
      );
      return { embed, pages: mappedGlobalScores.pages };
    };
    return await getEmbedWithPaginatorButtons(
      interaction,
      fetchGlobalScoresEmbed
    );
  }

  private async getGuildHighScoreEmbed(
    interaction: ChatInputCommandInteraction
  ) {
    const fetchGuildScoresEmbed = async (page: number) => {
      const mappedGuildScores = await getGuildScores(interaction, page);
      const embed = await createLeaderboardTable(
        mappedGuildScores,
        page,
        `${interaction.guild.name} leaderboard`
      );
      return { embed, pages: mappedGuildScores.pages };
    };
    return await getEmbedWithPaginatorButtons(
      interaction,
      fetchGuildScoresEmbed
    );
  }
}
