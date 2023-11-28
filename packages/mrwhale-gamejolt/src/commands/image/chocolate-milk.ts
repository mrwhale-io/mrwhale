import { createCanvas, loadImage } from "canvas";
import * as path from "path";

import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";
import { fetchImageFromUrl } from "../../util/fetch-image-from-url";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "chocolatemilk",
      description: "Edits your avatar to hold chocolate milk.",
      type: "image",
      usage: "<prefix>chocolatemilk",
      aliases: ["choccy", "milk", "choccymilk"],
      cooldown: 5000,
    });
  }

  async action(message: Message): Promise<void> {
    const responseMsg = await message.reply("Processing please wait...");
    const base = await loadImage(
      path.join(__dirname, "..", "..", "..", "images", "chocolate-milk.png")
    );
    const avatar = await fetchImageFromUrl(message.user.img_avatar);
    const canvas = createCanvas(base.width, base.height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(255, 255, 255, 0)";
    ctx.fillRect(0, 0, base.width, base.height);
    ctx.drawImage(avatar, 0, 0, 512, 512);
    ctx.drawImage(base, 0, 0);

    return uploadImage(canvas, responseMsg);
  }
}
