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
      name: "amongus",
      description: "Makes you an among us crewmate.",
      type: "image",
      usage: "<prefix>amongus @user",
      aliases: ["sus"],
      cooldown: 5000,
    });
    this.slashCommandData.addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user's avatar.")
        .setRequired(false)
    );
  }

  async action(message: Message): Promise<Message<boolean>> {
    const user = message.mentions.users.first() || message.author;
    const responseMsg = await message.reply("Processing please wait...");
    const attachment = await this.generateImage(
      user.displayAvatarURL({ extension: "png", size: 512 })
    );

    return responseMsg.edit({ files: [attachment], content: null });
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const user = interaction.options.getUser("user") || interaction.user;
    await interaction.deferReply();
    const attachment = await this.generateImage(
      user.displayAvatarURL({ extension: "png", size: 512 })
    );

    interaction.editReply({ files: [attachment] });
  }

  private async generateImage(avatarUrl: string): Promise<AttachmentBuilder> {
    const avatarFile = await axios.get(avatarUrl, {
      responseType: "arraybuffer",
    });
    const amongus = await loadImage(
      path.join(__dirname, "..", "..", "..", "images", "amongus.png")
    );
    const avatar = await loadImage(avatarFile.data);
    const canvas = createCanvas(amongus.width, amongus.height);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = `white`;
    ctx.fillRect(0, 0, amongus.width, amongus.height);
    ctx.drawImage(avatar, 350, 150, 365, 273);
    ctx.drawImage(amongus, 0, 0);

    const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
      name: "amongus.png",
    });

    return attachment;
  }
}
