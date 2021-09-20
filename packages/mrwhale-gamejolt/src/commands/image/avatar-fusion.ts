import axios from "axios";
import { createCanvas, loadImage } from "canvas";
import * as fs from "fs";
import { file } from "tmp-promise";
import { Content, Message } from "@mrwhale-io/gamejolt-client";

import { Command } from "../command";

export default class extends Command {
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

  async action(message: Message): Promise<Message> {
    const overlayUser = message.mentions[0];
    const baseUser = message.mentions[1] || message.user;
    if (!overlayUser) {
      return message.reply("Please mention a user.");
    }

    const responseMsg = await message.reply("Processing please wait...");
    const content = new Content();
    const baseAvatarFile = await axios.get(baseUser.img_avatar, {
      responseType: "arraybuffer",
    });
    const overlayAvatarFile = await axios.get(overlayUser.img_avatar, {
      responseType: "arraybuffer",
    });

    const avatar = await loadImage(baseAvatarFile.data);
    const secondAvatar = await loadImage(overlayAvatarFile.data);

    const canvas = createCanvas(avatar.width, avatar.height);
    const ctx = canvas.getContext("2d");
    ctx.globalAlpha = 0.5;
    ctx.drawImage(avatar, 0, 0);
    ctx.drawImage(secondAvatar, 0, 0, avatar.width, avatar.height);

    try {
      const { path, cleanup } = await file({ postfix: ".png" });
      const out = fs.createWriteStream(path);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", async () => {
        const mediaItem = await this.client.chat.uploadFile(
          fs.createReadStream(path),
          message.room_id
        );

        await content.insertImage(mediaItem);
        responseMsg.edit(content);

        cleanup();
      });
    } catch (e) {
      responseMsg.edit("Could not create image.");
    }
  }
}
