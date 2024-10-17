import { ChatInputCommandInteraction, Message } from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import { getEmbedWithPaginatorButtons } from "../../util/button/paginator-buttons";
import { getLeaderboardTable } from "../../database/services/leaderboard";

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
    this.slashCommandData.addStringOption((option) =>
      option
        .setName("leaderboard")
        .setDescription("The category of leaderboard.")
        .addChoices(
          { name: "Chests opened", value: "chestsopened" },
          { name: "Exp", value: "exp" },
          { name: "Fish caught", value: "fishcaught" },
          { name: "Gems", value: "gems" }
        )
    );
    this.slashCommandData.addBooleanOption((option) =>
      option
        .setName("global")
        .setDescription("Whether this is a global leaderboard.")
        .setRequired(false)
    );
  }

  async action(message: Message): Promise<void> {}

  async slashCommandAction(interaction: ChatInputCommandInteraction) {
    try {
      const leaderboard = interaction.options.getString("leaderboard") || "exp";
      const isGlobal = interaction.options.getBoolean("global") || false;

      return await this.getHighScoreEmbed(interaction, leaderboard, isGlobal);
    } catch(error) {
      this.botClient.logger.error(error);
      return interaction.reply("Could not fetch leaderboard.");
    }
  }

  private async getHighScoreEmbed(
    interaction: ChatInputCommandInteraction,
    type: string,
    isGlobal: boolean = false
  ) {
    const fetchGuildScoresEmbed = async (page: number) => {
      const { table, pages } = await getLeaderboardTable(
        interaction,
        type,
        page,
        isGlobal
      );

      return { embed: table, pages };
    };
    return await getEmbedWithPaginatorButtons(
      interaction,
      fetchGuildScoresEmbed
    );
  }
}
