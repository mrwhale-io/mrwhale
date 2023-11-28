import { createCanvas, loadImage } from "canvas";
import * as path from "path";

import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";
import { fetchImageFromUrl } from "../../util/fetch-image-from-url";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "amongus",
      description: "Makes you an among us crewmate.",
      type: "image",
      usage: "<prefix>amongus @user",
      aliases: ["sus"],
      cooldown: 5000,
    });
  }

  async action(message: Message): Promise<void> {
    const user = message.firstMentionOrAuthor;
    const responseMsg = await message.reply("Processing please wait...");
    const amongus = await loadImage(
      path.join(__dirname, "..", "..", "..", "images", "amongus.png")
    );
    const canvas = createCanvas(amongus.width, amongus.height);
    const ctx = canvas.getContext("2d");
    const avatar = await fetchImageFromUrl(user.img_avatar);

    ctx.fillStyle = `white`;
    ctx.fillRect(0, 0, amongus.width, amongus.height);
    ctx.drawImage(avatar, 350, 150, 365, 273);
    ctx.drawImage(amongus, 0, 0);

    return uploadImage(canvas, responseMsg);
  }
}
