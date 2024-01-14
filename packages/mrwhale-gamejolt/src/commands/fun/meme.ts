import axios from "axios";

import { meme } from "@mrwhale-io/commands";
import { link, unorderedList } from "@mrwhale-io/core";
import { Message, Content, MediaItem } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

const TIME_TO_FETCH = 60 * 60 * 1000;

interface MemeCache {
  [subreddit: string]: { memes: meme.RedditPost[]; lastFetch: number };
}

export default class extends GameJoltCommand {
  constructor() {
    super(meme.data);
  }

  private memeCache: MemeCache = {};
  private cachedMediaItems: { [id: string]: MediaItem } = {};
  private previous: MediaItem;

  async action(message: Message, [category]: [string]): Promise<Message> {
    const memeCategory = category ?? "meme";

    if (memeCategory.toLowerCase().trim() === "categories") {
      return message.reply(
        unorderedList(
          Object.keys(meme.SUBREDDITS).map((subreddit) => subreddit)
        )
      );
    }
    let memes: meme.RedditPost[];
    try {
      memes = await this.fetchMemes(message.room_id, memeCategory);
    } catch (error) {
      return message.reply(error);
    }

    if (!memes.length) {
      return message.reply(
        "It seems I'm out of fresh memes!, Try again later."
      );
    }
    const content = new Content();
    const selectedMeme = memes[Math.floor(Math.random() * memes.length)];
    const memeId = selectedMeme.postLink.substring(
      selectedMeme.postLink.lastIndexOf("/") + 1
    );
    const mediaItem = this.cachedMediaItems[memeId];

    if (!mediaItem) {
      try {
        const file = await axios.get(selectedMeme.url, {
          responseType: "stream",
        });

        const mediaItem = await this.botClient.client.chat.uploadFile(
          file.data,
          message.room_id
        );
        this.cachedMediaItems[memeId] = mediaItem;
        this.previous = mediaItem;
        content.insertImage(mediaItem);
      } catch {
        this.previous
          ? content.insertImage(this.previous)
          : content.insertText("Could not fetch meme.");
      }
    } else {
      content.insertImage(mediaItem);
    }

    content.insertText(`Original post: ${selectedMeme.postLink}`);

    return message.reply(content);
  }

  private isTimeToFetch(subreddit: string) {
    if (!this.memeCache[subreddit]) {
      this.memeCache[subreddit] = { memes: [], lastFetch: -Infinity };
    }

    const lastFetchTimestamp = this.memeCache[subreddit].lastFetch;

    return Date.now() - lastFetchTimestamp >= TIME_TO_FETCH;
  }

  private async fetchMemes(roomId: number, category: string) {
    if (!meme.isValidCategory(category)) {
      const prefix = await this.botClient.getPrefix(roomId);
      throw `You must pass a valid category. Use \`${prefix}meme categories\` for help.`;
    }

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
}
