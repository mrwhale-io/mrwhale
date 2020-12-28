import axios from "axios";
import { Message, Content, MediaItem } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

interface Post {
  id: string;
  url: string;
}

export default class extends Command {
  constructor() {
    super({
      name: "meme",
      description: "Get a random meme from reddit.",
      type: "fun",
      usage: "<prefix>meme",
      cooldown: 3000,
    });
    this.fetchMemes();
    setInterval(() => this.fetchMemes(), 60 * 60 * 1000);
  }

  private memes: Post[] = [];
  private cachedMediaItems: { [id: string]: MediaItem } = {};
  private previous: MediaItem;

  private async fetchMemes() {
    const { data } = await axios.get(
      "https://www.reddit.com/r/dankmemes.json?sort=top&t=week"
    );
    this.memes = data.data.children
      .filter((post) => !post.data.over_18)
      .map((post) => post.data);
  }

  async action(message: Message): Promise<void> {
    if (!this.memes.length) {
      return message.reply(
        "It seems we are out of fresh memes!, Try again later."
      );
    }
    const content = new Content();
    const meme = this.memes[Math.floor(Math.random() * this.memes.length)];
    const mediaItem = this.cachedMediaItems[meme.id];

    if (!mediaItem) {
      const file = await axios.get(meme.url, {
        responseType: "stream",
      });

      const mediaItem = await this.client.chat.uploadFile(
        file.data,
        message.room_id
      );

      if (mediaItem && mediaItem.id) {
        this.cachedMediaItems[meme.id] = mediaItem;
        this.previous = mediaItem;
        await content.insertImage(mediaItem);
      } else {
        this.previous
          ? content.insertImage(this.previous)
          : content.insertText("Could not fetch meme.");
      }
    } else {
      await content.insertImage(mediaItem);
    }

    return message.reply(content);
  }
}
