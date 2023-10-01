import { Message } from "@mrwhale-io/gamejolt-client";
import * as canvacord from "canvacord";
import { createCanvas, loadImage } from "canvas";

import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "rainbow",
      description: "Puts a rainbow over the provided user avatar.",
      type: "image",
      usage: "<prefix>rainbow [@user]",
      aliases: ["gay", "lgbt", "pride"],
      cooldown: 5000,
    });
  }

  async action(message: Message): Promise<void> {
    const user = message.firstMentionOrAuthor;
    const responseMsg = await message.reply("Processing please wait...");
    const image = await loadImage(await canvacord.Canvas.rainbow(user.img_avatar));
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);

    return uploadImage(canvas, responseMsg);
  }
}
