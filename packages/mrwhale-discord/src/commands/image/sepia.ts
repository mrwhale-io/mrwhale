import * as jimp from "jimp";
import { createCanvas, loadImage } from "canvas";
import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "sepia",
      description: "Adds sepia effect to your avatar.",
      type: "image",
      usage: "<prefix>sepia [@user]",
      cooldown: 5000,
    });
    this.slashCommandData.addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to add the effect to.")
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
    const image = await jimp.read(avatarUrl);
    image.sepia();
    const buffer = await image.getBufferAsync(jimp.MIME_PNG);
    const blurred = await loadImage(buffer);
    const canvas = createCanvas(image.getWidth(), image.getHeight());
    const ctx = canvas.getContext("2d");
    ctx.drawImage(blurred, 0, 0);

    const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
      name: "sepia.png",
    });

    return attachment;
  }
}
