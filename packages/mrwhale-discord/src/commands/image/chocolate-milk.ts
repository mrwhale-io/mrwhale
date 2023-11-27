import axios from "axios";
import {
  ChatInputCommandInteraction,
  Message,
  AttachmentBuilder,
} from "discord.js";
import { createCanvas, loadImage } from "canvas";
import * as path from "path";

import { DiscordCommand } from "../../client/command/discord-command";
import { AVATAR_OPTIONS } from "../../constants";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "chocolatemilk",
      description: "Edits your avatar to hold chocolate milk.",
      type: "image",
      usage: "<prefix>chocolatemilk",
      aliases: ["choccy", "milk", "choccymilk"],
      cooldown: 5000,
      clientPermissions: ["AttachFiles"],
    });
  }

  async action(message: Message): Promise<Message<boolean>> {
    const responseMsg = await message.reply("Processing please wait...");
    const attachment = await this.generateImage(
      message.author.displayAvatarURL(AVATAR_OPTIONS)
    );
    return responseMsg.edit({ files: [attachment], content: null });
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    await interaction.deferReply();
    const attachment = await this.generateImage(
      interaction.user.displayAvatarURL(AVATAR_OPTIONS)
    );

    interaction.editReply({ files: [attachment] });
  }

  private async generateImage(avatarUrl: string): Promise<AttachmentBuilder> {
    const avatarFile = await axios.get(avatarUrl, {
      responseType: "arraybuffer",
    });
    const base = await loadImage(
      path.join(__dirname, "..", "..", "..", "images", "chocolate-milk.png")
    );
    const avatar = await loadImage(avatarFile.data);
    const canvas = createCanvas(base.width, base.height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(255, 255, 255, 0)";
    ctx.fillRect(0, 0, base.width, base.height);
    ctx.drawImage(avatar, 0, 0, 512, 512);
    ctx.drawImage(base, 0, 0);

    const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
      name: "chocolate-milk.png",
    });

    return attachment;
  }
}
