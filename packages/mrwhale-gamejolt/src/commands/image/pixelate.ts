import * as canvacord from "canvacord";
import { createCanvas, loadImage } from "canvas";

import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "pixelate",
      description: "Pixelate your avatar.",
      type: "image",
      usage: "<prefix>pixelate",
      cooldown: 5000,
    });
  }

  async action(message: Message, [level]: [number]): Promise<void> {
    const user = message.firstMentionOrAuthor;
    const responseMsg = await message.reply("Processing please wait...");
    const image = await loadImage(
      await canvacord.Canvas.pixelate(
        user.img_avatar,
        !isNaN(level) ? +level : 5
      )
    );
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);

    return uploadImage(canvas, responseMsg);
  }
}
