import * as canvacord from "canvacord";
import { createCanvas, loadImage } from "canvas";

import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";
import { fetchImageFromUrl } from "../../util/fetch-image-from-url";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "youtube",
      description: "Generate a YouTube comment.",
      type: "image",
      usage: "<prefix>youtube [comment] [@user]",
      cooldown: 5000,
    });
  }

  async action(message: Message, [comment]: [string]): Promise<Message | void> {
    if (!comment) {
      return message.reply("Please provide a comment.");
    }

    const user = message.firstMentionOrAuthor;
    const responseMsg = await message.reply("Processing please wait...");
    const image = await loadImage(
      await canvacord.Canvas.youtube({
        username: user.username,
        content: comment.replace(/(@[^\s]+)/, ""),
        avatar: await this.circleAvatar(user.img_avatar),
        dark: true,
      })
    );

    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);

    return uploadImage(canvas, responseMsg);
  }

  private async circleAvatar(avatarUrl: string) {
    const avatar = await fetchImageFromUrl(avatarUrl);
    const canvas = createCanvas(avatar.width, avatar.height);
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      canvas.height / 2,
      0,
      Math.PI * 2
    );
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 0, 0);

    return canvas.toBuffer("image/png");
  }
}
