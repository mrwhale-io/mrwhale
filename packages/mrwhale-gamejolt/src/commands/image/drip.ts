import { createCanvas, loadImage } from "canvas";
import * as path from "path";

import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";
import { fetchImageFromUrl } from "../../util/fetch-image-from-url";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "drip",
      description: "Places your avatar on hyperbeast goku.",
      type: "image",
      usage: "<prefix>drip @user",
      cooldown: 5000,
    });
  }

  async action(message: Message): Promise<void> {
    const user = message.firstMentionOrAuthor;
    const responseMsg = await message.reply("Processing please wait...");
    const drip = await loadImage(
      path.join(__dirname, "..", "..", "..", "images", "drip.png")
    );
    const avatar = await fetchImageFromUrl(user.img_avatar);
    const canvas = createCanvas(drip.width, drip.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(drip, 0, 0);
    const ratio = drip.height / 3 / avatar.height;
    const width = avatar.width * ratio;
    ctx.drawImage(avatar, width, avatar.height / 3, width, drip.height / 3);

    return uploadImage(canvas, responseMsg);
  }
}
