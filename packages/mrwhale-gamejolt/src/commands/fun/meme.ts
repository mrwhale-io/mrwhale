import axios from "axios";

import { meme } from "@mrwhale-io/commands";
import { Message, Content, MediaItem } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

const FETCH_INTERVAL = 60 * 60 * 1000;

export default class extends GameJoltCommand {
  constructor() {
    super(meme.data);
    this.init();
  }

  private memes: meme.RedditPost[] = [];
  private cachedMediaItems: { [id: string]: MediaItem } = {};
  private previous: MediaItem;

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
        content.insertImage(mediaItem);
      } catch {
        this.previous
          ? content.insertImage(this.previous)
          : content.insertText("Could not fetch meme.");
      }
    } else {
      content.insertImage(mediaItem);
    }

    return message.reply(content);
  }

  private async init() {
    this.memes = await meme.fetchMemes();
    setInterval(
      async () => (this.memes = await meme.fetchMemes()),
      FETCH_INTERVAL
    );
  }
}
