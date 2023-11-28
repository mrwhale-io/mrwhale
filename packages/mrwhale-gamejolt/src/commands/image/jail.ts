import * as canvacord from "canvacord";
import { createCanvas, loadImage } from "canvas";

import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "jail",
      description: "Puts a user in jail.",
      type: "image",
      usage: "<prefix>jail [@user]",
      cooldown: 5000,
    });
  }

  async action(message: Message): Promise<void> {
    const user = message.firstMentionOrAuthor;
    const responseMsg = await message.reply("Processing please wait...");
    const image = await loadImage(await canvacord.Canvas.jail(user.img_avatar));
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);

    return uploadImage(canvas, responseMsg);
  }
}
