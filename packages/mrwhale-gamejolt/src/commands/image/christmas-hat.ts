import { createCanvas, loadImage } from "canvas";
import * as path from "path";

import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";
import { fetchImageFromUrl } from "../../util/fetch-image-from-url";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "christmashat",
      description: "Edits an avatar to have a christmas hat.",
      type: "image",
      usage: "<prefix>christmashat @user",
      aliases: ["santahat"],
      cooldown: 5000,
    });
  }

  async action(message: Message): Promise<void> {
    const user = message.firstMentionOrAuthor;
    const responseMsg = await message.reply("Processing please wait...");
    const base = await loadImage(
      path.join(__dirname, "..", "..", "..", "images", "christmas-hat.png")
    );
    const avatar = await fetchImageFromUrl(user.img_avatar);
    const canvas = createCanvas(avatar.width, avatar.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(avatar, 0, 0);
    const ratio = avatar.height / base.height;
    const width = base.width * ratio;
    ctx.drawImage(
      base,
      avatar.width - width / 1.2,
      0 - avatar.height / 3.5,
      width,
      avatar.height
    );

    return uploadImage(canvas, responseMsg);
  }
}
