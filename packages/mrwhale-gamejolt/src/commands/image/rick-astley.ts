import { Message } from "@mrwhale-io/gamejolt-client";
import axios from "axios";
import { createCanvas, loadImage } from "canvas";
import * as path from "path";

import { Command } from "../command";
import { uploadImage } from "../../image/upload-image";

export default class extends Command {
  constructor() {
    super({
      name: "rickastley",
      description: "Places your avatar on Rick Astley.",
      type: "image",
      usage: "<prefix>rickastley @user",
      cooldown: 5000,
      aliases: ["rick", "rickroll"],
    });
  }

  async action(message: Message): Promise<void> {
    const user = message.firstMentionOrAuthor;
    const responseMsg = await message.reply("Processing please wait...");
    const avatarFile = await axios.get(user.img_avatar, {
      responseType: "arraybuffer",
    });
    const rick = await loadImage(
      path.join(__dirname, "..", "..", "..", "images", "Rick-astley.png")
    );
    const avatar = await loadImage(avatarFile.data);
    const canvas = createCanvas(rick.width, rick.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(rick, 0, 0);
    const ratio = rick.height / 3 / avatar.height;
    const width = avatar.width * ratio;
    ctx.drawImage(
      avatar,
      width + width / 2,
      avatar.height / 4,
      width,
      rick.height / 3
    );

    return uploadImage(canvas, responseMsg);
  }
}
