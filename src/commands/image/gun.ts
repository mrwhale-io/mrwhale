import axios from "axios";
import { createCanvas, loadImage } from "canvas";
import * as fs from "fs";
import * as path from "path";
import { file } from "tmp-promise";
import { Content, Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "gun",
      description: "Edits your avatar to hold a gun.",
      type: "image",
      usage: "<prefix>gun",
      aliases: ["deletethis"],
      cooldown: 5000,
    });
  }

  async action(message: Message): Promise<void> {
    const responseMsg = await message.reply("Processing please wait...");
    const content = new Content();
    const avatarFile = await axios.get(message.user.img_avatar, {
      responseType: "arraybuffer",
    });
    const base = await loadImage(
      path.join(__dirname, "..", "..", "..", "images", "gun.png")
    );
    const avatar = await loadImage(avatarFile.data);
    const canvas = createCanvas(avatar.width, avatar.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(avatar, 0, 0);
    const ratio = avatar.height / 2 / base.height;
    const width = base.width * ratio;
    ctx.drawImage(
      base,
      avatar.width - width,
      avatar.height - avatar.height / 2,
      width,
      avatar.height / 2
    );

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
      return message.edit("Could not create image.");
    }
  }
}
