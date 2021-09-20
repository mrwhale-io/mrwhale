import { Message } from "@mrwhale-io/gamejolt-client";
import axios from "axios";
import { createCanvas, loadImage } from "canvas";
import * as path from "path";

import { Command } from "../command";
import { uploadImage } from "../../image/upload-image";

export default class extends Command {
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
    let user = message.mentions[0];
    if (!user) {
      user = message.user;
    }

    const responseMsg = await message.reply("Processing please wait...");
    const avatarFile = await axios.get(user.img_avatar, {
      responseType: "arraybuffer",
    });
    const drip = await loadImage(
      path.join(__dirname, "..", "..", "..", "images", "drip.png")
    );
    const avatar = await loadImage(avatarFile.data);
    const canvas = createCanvas(drip.width, drip.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(drip, 0, 0);
    const ratio = drip.height / 3 / avatar.height;
    const width = avatar.width * ratio;
    ctx.drawImage(avatar, width, avatar.height / 3, width, drip.height / 3);

    return uploadImage(canvas, responseMsg);
  }
}
