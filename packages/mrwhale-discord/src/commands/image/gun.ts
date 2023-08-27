import axios from "axios";
import {
  ChatInputCommandInteraction,
  Message,
  AttachmentBuilder,
} from "discord.js";
import { createCanvas, loadImage } from "canvas";
import * as path from "path";

import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "gun",
      description: "Edits your avatar to hold a gun.",
      type: "image",
      usage: "<prefix>gun",
      aliases: ["deletethis"],
      cooldown: 5000,
      clientPermissions: ["AttachFiles"],
    });
  }

  async action(message: Message): Promise<Message<boolean>> {
    const responseMsg = await message.reply("Processing please wait...");
    const attachment = await this.generateImage(
      message.author.displayAvatarURL({ extension: "png", size: 512 })
    );

    return responseMsg.edit({ files: [attachment], content: null });
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    await interaction.deferReply();
    const attachment = await this.generateImage(
      interaction.user.displayAvatarURL({ extension: "png", size: 512 })
    );

    interaction.editReply({ files: [attachment] });
  }

  private async generateImage(avatarUrl: string): Promise<AttachmentBuilder> {
    const avatarFile = await axios.get(avatarUrl, {
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

    const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
      name: "gun.png",
    });

    return attachment;
  }
}
