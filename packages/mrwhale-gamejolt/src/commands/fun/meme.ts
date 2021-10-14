import axios from "axios";
import { Message, Content, MediaItem } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
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

  private memes: {
    id: string;
    url: string;
  }[] = [];
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

  async action(message: Message): Promise<Message> {
    if (!this.memes.length) {
      return message.reply(
        "It seems I'm out of fresh memes!, Try again later."
      );
    }
    const content = new Content();
    const meme = this.memes[Math.floor(Math.random() * this.memes.length)];
    const mediaItem = this.cachedMediaItems[meme.id];

    if (!mediaItem) {
      try {
        const file = await axios.get(meme.url, {
          responseType: "stream",
        });

        const mediaItem = await this.botClient.client.chat.uploadFile(
          file.data,
          message.room_id
        );
        this.cachedMediaItems[meme.id] = mediaItem;
        this.previous = mediaItem;
        await content.insertImage(mediaItem);
      } catch {
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
