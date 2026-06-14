import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "jamsubmit",
      description: "Submit your microgame to the current weekly jam.",
      type: "game",
      usage: "<prefix>jamsubmit",
      guildOnly: true,
    });
    this.slashCommandData
      .addStringOption((o) =>
        o.setName("title").setDescription("The title of your game").setRequired(true).setMaxLength(100)
      )
      .addStringOption((o) =>
        o.setName("url").setDescription("Link to play or download your game").setRequired(true)
      )
      .addStringOption((o) =>
        o.setName("description").setDescription("Short description of your game (optional)").setRequired(false).setMaxLength(500)
      );
  }

  async action(message: Message): Promise<Message> {
    return message.reply("Please use the slash command `/jamsubmit` to submit your game.");
  }

  async slashCommandAction(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const title = interaction.options.getString("title", true);
    const url = interaction.options.getString("url", true);
    const description = interaction.options.getString("description") ?? undefined;

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      await interaction.editReply("❌ Please provide a valid URL for your game.");
      return;
    }

    const result = await this.botClient.jamManager.submitGame(
      interaction.guildId!,
      interaction.user.id,
      title,
      url,
      description
    );

    if (!result.success) {
      await interaction.editReply(`❌ ${result.error}`);
      return;
    }

    const jam = await this.botClient.jamManager.getCurrentJam(interaction.guildId!);

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle("✅ Game Submitted!")
      .setDescription(`Your game has been entered into **Jam #${jam!.weekNumber}: ${jam!.theme}**!`)
      .addFields(
        { name: "🎮 Game Title", value: title },
        { name: "🔗 Link", value: url },
        ...(description ? [{ name: "📝 Description", value: description }] : [])
      )
      .setFooter({ text: "Good luck! 🐋 The squid council is watching." })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
}
