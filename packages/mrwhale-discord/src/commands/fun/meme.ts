import { ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";

import { meme } from "@mrwhale-io/commands";
import { DiscordCommand } from "../../client/command/discord-command";
import { EMBED_COLOR } from "../../constants";

const TIME_TO_FETCH = 60 * 60 * 1000;

interface MemeCache {
  [subreddit: string]: { memes: meme.RedditPost[]; lastFetch: number };
}

export default class extends DiscordCommand {
  private memeCache: MemeCache = {};
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
      const memes = await this.fetchMemes();
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
      const memes = await this.fetchMemes(category);

      await this.replyWithMeme(interaction, memes);
    } catch {
      await interaction.reply("Could not fetch memes.");
    }
  }

  private isTimeToFetch(subreddit: string) {
    if (!this.memeCache[subreddit]) {
      this.memeCache[subreddit] = { memes: [], lastFetch: -Infinity };
    }

    const lastFetchTimestamp = this.memeCache[subreddit].lastFetch;

    return Date.now() - lastFetchTimestamp >= TIME_TO_FETCH;
  }

  private setupEmbed(post: meme.RedditPost): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(post.title)
      .setURL(post.url)
      .setColor(EMBED_COLOR)
      .setDescription(
        `Posted by ${post.author} | :small_red_triangle: ${post.ups} upvotes`
      )
      .setImage(post.url)
      .setFooter({
        text: `Posted in ${post.subreddit}`,
      });
  }

  private async fetchMemes(category: string = "meme") {
    const timeForFetch = this.isTimeToFetch(category);

    let memeCache = this.memeCache[category];

    if (timeForFetch) {
      const memes = await meme.fetchMemes(category);
      this.memeCache[category].memes = memes;
      this.memeCache[category].lastFetch = Date.now();

      return memes;
    }

    return memeCache.memes;
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
