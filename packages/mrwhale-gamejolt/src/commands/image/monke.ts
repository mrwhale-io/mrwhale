import { createCanvas, loadImage } from "canvas";
import * as path from "path";

import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";
import { fetchImageFromUrl } from "../../util/fetch-image-from-url";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "monke",
      description: "Places your avatar on monke.",
      type: "image",
      usage: "<prefix>monke @user",
      cooldown: 5000,
    });
  }

  async action(message: Message): Promise<void> {
    const user = message.firstMentionOrAuthor;
    const responseMsg = await message.reply("Processing please wait...");
    const monke = await loadImage(
      path.join(__dirname, "..", "..", "..", "images", "monke.png")
    );
    const avatar = await fetchImageFromUrl(user.img_avatar);
    const canvas = createCanvas(monke.width, monke.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(monke, 0, 0);
    const ratio = monke.height / 3 / avatar.height;
    const width = avatar.width * ratio;
    ctx.drawImage(avatar, width, 0, width, monke.height / 3);

    return uploadImage(canvas, responseMsg);
  }
}
