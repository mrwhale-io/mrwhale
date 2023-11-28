import { createCanvas, loadImage } from "canvas";
import * as path from "path";

import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";
import { fetchImageFromUrl } from "../../util/fetch-image-from-url";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "gun",
      description: "Edits your avatar to hold a gun.",
      type: "image",
      usage: "<prefix>gun",
      aliases: ["deletethis"],
      cooldown: 5000,
    });
  }

  async action(message: Message): Promise<void> {
    const responseMsg = await message.reply("Processing please wait...");
    const base = await loadImage(
      path.join(__dirname, "..", "..", "..", "images", "gun.png")
    );
    const avatar = await fetchImageFromUrl(message.user.img_avatar);
    const canvas = createCanvas(avatar.width, avatar.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(avatar, 0, 0);
    const ratio = avatar.height / 2 / base.height;
    const width = base.width * ratio;
    ctx.drawImage(
      base,
      avatar.width - width,
      avatar.height - avatar.height / 2,
      width,
      avatar.height / 2
    );

    return uploadImage(canvas, responseMsg);
  }
}
