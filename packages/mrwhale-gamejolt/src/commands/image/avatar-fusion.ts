import { createCanvas } from "canvas";

import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";
import { fetchImageFromUrl } from "../../util/fetch-image-from-url";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "avatarfusion",
      description: "Fuses two user avatars together.",
      type: "image",
      usage: "<prefix>avatarfusion <@user1> <@user2>",
      aliases: ["fuse", "fusion"],
      cooldown: 5000,
    });
  }

  async action(message: Message): Promise<void | Message> {
    const overlayUser = message.mentions[0];
    const baseUser = message.mentions[1] || message.user;
    if (!overlayUser) {
      return message.reply("Please mention a user.");
    }

    const responseMsg = await message.reply("Processing please wait...");
    const avatar = await fetchImageFromUrl(baseUser.img_avatar);
    const secondAvatar = await fetchImageFromUrl(overlayUser.img_avatar);

    const canvas = createCanvas(avatar.width, avatar.height);
    const ctx = canvas.getContext("2d");
    ctx.globalAlpha = 0.5;
    ctx.drawImage(avatar, 0, 0);
    ctx.drawImage(secondAvatar, 0, 0, avatar.width, avatar.height);

    return uploadImage(canvas, responseMsg);
  }
}
