import axios from "axios";
import { Message, Content, MediaItem } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

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

  private memes: string[] = [];
  private cachedMediaItems: { [id: string]: MediaItem } = {};

  private async fetchMemes() {
    const { data } = await axios.get(
      "https://www.reddit.com/r/dankmemes.json?sort=top&t=week"
    );
    this.memes = data.data.children
      .filter((post) => !post.data.over_18)
      .map((post) => post.data.url);
  }

  async action(message: Message): Promise<void> {
    try {
      if (!this.memes.length)
        return message.reply(
          "It seems we are out of fresh memes!, Try again later."
        );
      const index = Math.floor(Math.random() * this.memes.length);
      const meme = this.memes[index];
      const content = new Content();

      const regex = /https:\/\/i.redd.it\/([a-zA-Z0-9]+)\.[a-zA-Z0-9]+/;
      const cachedItemId = meme.match(regex)[1];
      const cachedMediaItem = this.cachedMediaItems[cachedItemId];

      if (!cachedMediaItem) {
        const file = await axios.get(meme, {
          responseType: "stream",
        });

        const mediaItem = await this.client.chat.uploadFile(
          file.data,
          message.room_id
        );

        const id = mediaItem.filename.split("-")[0];
        this.cachedMediaItems[id] = mediaItem;
        await content.insertImage(mediaItem);
      } else {
        await content.insertImage(this.cachedMediaItems[cachedItemId]);
      }

      return message.reply(content);
    } catch (e) {
      console.log(e);
      return message.reply("Could not fetch meme.");
    }
  }
}
