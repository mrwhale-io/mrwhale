import { createCanvas, loadImage } from "canvas";
import * as path from "path";

import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";
import { fetchImageFromUrl } from "../../util/fetch-image-from-url";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "beep",
      description: "Places your avatar on fnf Boyfriend.",
      type: "image",
      usage: "<prefix>beep @user",
      cooldown: 5000,
      aliases: ["bop"],
    });
  }

  async action(message: Message): Promise<void> {
    const user = message.firstMentionOrAuthor;
    const responseMsg = await message.reply("Processing please wait...");
    const keith = await loadImage(
      path.join(__dirname, "..", "..", "..", "images", "keith.png")
    );
    const avatar = await fetchImageFromUrl(user.img_avatar);
    const canvas = createCanvas(keith.width, keith.height);

    const ctx = canvas.getContext("2d");
    ctx.drawImage(keith, 0, 0);
    const ratio = keith.height / 3 / avatar.height;
    const width = avatar.width * ratio;
    ctx.drawImage(avatar, width, avatar.height / 4, width, keith.height / 3);

    return uploadImage(canvas, responseMsg);
  }
}
