import { createCanvas, loadImage } from "canvas";
import * as path from "path";

import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";
import { fetchImageFromUrl } from "../../util/fetch-image-from-url";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "bobross",
      description: "Paint a happy little avatar with Bob Ross.",
      type: "image",
      usage: "<prefix>bobross @user",
      cooldown: 5000,
    });
  }

  async action(message: Message): Promise<void> {
    const user = message.firstMentionOrAuthor;
    const responseMsg = await message.reply("Processing please wait...");
    const bobross = await loadImage(
      path.join(__dirname, "..", "..", "..", "images", "bobross.png")
    );
    const avatar = await fetchImageFromUrl(user.img_avatar);
    const canvas = createCanvas(bobross.width, bobross.height);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = `white`;
    ctx.fillRect(0, 0, bobross.width, bobross.height);
    ctx.drawImage(avatar, 15, 20, 440, 440);
    ctx.drawImage(bobross, 0, 0);


    return uploadImage(canvas, responseMsg);
  }
}
