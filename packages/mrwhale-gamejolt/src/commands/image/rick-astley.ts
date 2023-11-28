import { createCanvas, loadImage } from "canvas";
import * as path from "path";

import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";
import { fetchImageFromUrl } from "../../util/fetch-image-from-url";

export default class extends GameJoltCommand {
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
    const rick = await loadImage(
      path.join(__dirname, "..", "..", "..", "images", "Rick-astley.png")
    );
    const avatar = await fetchImageFromUrl(user.img_avatar);
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
