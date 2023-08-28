import { truncate } from "@mrwhale-io/core";
import { Message } from "@mrwhale-io/gamejolt-client";
import axios from "axios";
import { createCanvas, loadImage } from "canvas";
import * as path from "path";

import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "verify",
      description: "Get verified.",
      type: "image",
      usage: "<prefix>verify @user",
      cooldown: 5000,
    });
  }

  async action(message: Message): Promise<void> {
    const user = message.firstMentionOrAuthor;
    const responseMsg = await message.reply("Processing please wait...");
    const avatarFile = await axios.get(user.img_avatar, {
      responseType: "arraybuffer",
    });
    const userCard = await loadImage(
      path.join(__dirname, "..", "..", "..", "images", "verified.png")
    );
    const badge = await loadImage(
      path.join(__dirname, "..", "..", "..", "images", "verified-badge.png")
    );
    const avatar = await loadImage(avatarFile.data);
    const canvas = createCanvas(userCard.width, userCard.height);
    const ctx = canvas.getContext("2d");
    const radius = 70;
    const displayNameText = truncate(28, `${user.display_name}`);
    const fontFamily = "Nunito,Helvetica Neue,Helvetica,Arial,sans-serif";
    ctx.drawImage(userCard, 0, 0);

    ctx.font = `700 19px ${fontFamily}`;
    ctx.fillStyle = "#ffffff";
    const displayNameWidth = ctx.measureText(displayNameText).width;
    ctx.fillText(displayNameText, canvas.width / 2 - displayNameWidth / 2, 248);
    ctx.drawImage(
      badge,
      canvas.width / 2 + displayNameWidth / 2 + badge.width / 2,
      230
    );

    ctx.font = `13px ${fontFamily}`;
    ctx.fillStyle = "#837d78";
    const usernameWidth = ctx.measureText(`@${user.username}`).width;
    ctx.fillText(
      `@${user.username}`,
      canvas.width / 2 - usernameWidth / 2,
      270
    );

    ctx.beginPath();
    ctx.arc(
      canvas.width / 2,
      canvas.height / 3.5,
      radius,
      0,
      Math.PI * 2,
      true
    );
    ctx.closePath();
    ctx.clip();

    const aspect = avatar.height / avatar.width;
    const hsx = radius * Math.max(1.0 / aspect, 1.0);
    const hsy = radius * Math.max(aspect, 1.0);

    ctx.drawImage(
      avatar,
      canvas.width / 2 - hsx,
      canvas.height / 3.5 - hsy,
      hsx * 2,
      hsy * 2
    );

    return uploadImage(canvas, responseMsg);
  }
}
