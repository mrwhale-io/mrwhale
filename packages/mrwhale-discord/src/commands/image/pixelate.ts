import * as jimp from "jimp";
import { createCanvas, loadImage } from "canvas";
import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import { AVATAR_OPTIONS } from "../../constants";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "pixelate",
      description: "Pixelate your avatar.",
      type: "image",
      usage: "<prefix>pixelate",
      cooldown: 5000,
      clientPermissions: ["AttachFiles"],
    });
    this.slashCommandData.addIntegerOption((option) =>
      option.setName("level").setDescription("The level of pixelation.")
    );
    this.slashCommandData.addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to pixelate.")
        .setRequired(false)
    );
  }

  async action(message: Message, [level]: [number]): Promise<Message<boolean>> {
    const user = message.mentions.users.first() || message.author;
    const responseMsg = await message.reply("Processing please wait...");
    const attachment = await this.generateImage(
      user.displayAvatarURL(AVATAR_OPTIONS),
      level
    );

    return responseMsg.edit({ files: [attachment], content: null });
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const level = interaction.options.getInteger("level");
    const user = interaction.options.getUser("user") || interaction.user;
    await interaction.deferReply();
    const attachment = await this.generateImage(
      user.displayAvatarURL(AVATAR_OPTIONS),
      level
    );

    interaction.editReply({ files: [attachment] });
  }

  private async generateImage(
    avatarUrl: string,
    level: number
  ): Promise<AttachmentBuilder> {
    const image = await jimp.read(avatarUrl);
    image.pixelate(!isNaN(level) ? +level : 5);
    const buffer = await image.getBufferAsync(jimp.MIME_PNG);
    const blurred = await loadImage(buffer);
    const canvas = createCanvas(image.getWidth(), image.getHeight());
    const ctx = canvas.getContext("2d");
    ctx.drawImage(blurred, 0, 0);

    const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
      name: "pixel.png",
    });

    return attachment;
  }
}
