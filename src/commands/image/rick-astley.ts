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
      name: "rickastley",
      description: "Places your avatar on Rick Astley.",
      type: "image",
      usage: "<prefix>rickastley @user",
      cooldown: 5000,
      aliases: ["rick", "rickroll"],
    });
  }

  async action(message: Message): Promise<void> {
    let user = message.mentions[0];
    if (!user) {
      user = message.user;
    }

    const responseMsg = await message.reply("Processing please wait...");
    const content = new Content();
    const avatarFile = await axios.get(user.img_avatar, {
      responseType: "arraybuffer",
    });
    const rick = await loadImage(
      path.join(__dirname, "..", "..", "..", "images", "Rick-Astley.png")
    );
    const avatar = await loadImage(avatarFile.data);
    const canvas = createCanvas(rick.width, rick.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(rick, 0, 0);
    const ratio = rick.height / 3 / avatar.height;
    const width = avatar.width * ratio;
    ctx.drawImage(avatar, width + (width / 2), avatar.height / 4, width, rick.height / 3);

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
