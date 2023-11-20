import { ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";

import { meme } from "@mrwhale-io/commands";
import { DiscordCommand } from "../../client/command/discord-command";
import { EMBED_COLOR } from "../../constants";

export default class extends DiscordCommand {
  constructor() {
    super(meme.data);
    this.slashCommandData.addStringOption((option) =>
      option
        .setName("category")
        .setDescription("The category of meme to fetch.")
        .addChoices(
          { name: "meme", value: "meme" },
          { name: "anime", value: "anime" },
          { name: "cats", value: "cats" },
          { name: "comics", value: "comics" },
          { name: "programming", value: "programming" }
        )
    );
  }

  async action(message: Message): Promise<void> {
    try {
      const memes = await meme.fetchMemes();
      await this.replyWithMeme(message, memes);
    } catch {
      await message.reply("Could not fetch memes.");
    }
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    try {
      const category = interaction.options.getString("category") ?? "meme";
      const memes = await meme.fetchMemes(category);
      await this.replyWithMeme(interaction, memes);
    } catch {
      await interaction.reply("Could not fetch memes.");
    }
  }

  private setupEmbed(post: meme.RedditPost): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(post.title)
      .setURL(`https://www.reddit.com${post.permalink}`)
      .setColor(EMBED_COLOR)
      .setDescription(
        `Posted by ${post.author} | :small_red_triangle: ${post.ups} upvotes`
      )
      .setImage(post.url)
      .setFooter({
        text: `Posted in ${post.subreddit_name_prefixed}`,
      });
  }

  private async replyWithMeme(
    interaction: ChatInputCommandInteraction | Message,
    memes: meme.RedditPost[]
  ): Promise<void> {
    if (!memes.length) {
      await interaction.reply("Fresh out of memes.");
      return;
    }

    const index = Math.floor(Math.random() * memes.length);
    const embed = this.setupEmbed(memes[index]);

    await interaction.reply({
      embeds: [embed],
    });
  }
}
