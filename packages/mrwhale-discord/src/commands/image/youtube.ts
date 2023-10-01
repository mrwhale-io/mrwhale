import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  Message,
} from "discord.js";
import { createCanvas, loadImage } from "canvas";
import * as canvacord from "canvacord";

import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "youtube",
      description: "Generate a YouTube comment.",
      type: "image",
      usage: "<prefix>youtube [comment] [@author]",
      aliases: ["yt"],
      cooldown: 5000,
    });
    this.slashCommandData.addStringOption((option) =>
      option
        .setName("comment")
        .setDescription("The YouTube comment.")
        .setRequired(true)
    );
    this.slashCommandData.addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The author of the YouTube comment.")
        .setRequired(false)
    );
  }

  async action(
    message: Message,
    [comment]: [string]
  ): Promise<Message<boolean>> {
    if (!comment) {
      return message.reply("Please provide a comment.");
    }

    const user = message.mentions.users.first() || message.author;
    const responseMsg = await message.reply("Processing please wait...");
    const attachment = await this.generateImage(
      user.username,
      comment.replace(/<@\d+>/, ""),
      user.displayAvatarURL({ extension: "png" })
    );

    return responseMsg.edit({ files: [attachment], content: null });
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const user = interaction.options.getUser("user") || interaction.user;
    const comment = interaction.options.getString("comment");
    await interaction.deferReply();
    const attachment = await this.generateImage(
      user.username,
      comment,
      user.displayAvatarURL({ extension: "png" })
    );

    interaction.editReply({ files: [attachment] });
  }

  private async generateImage(
    username: string,
    reply: string,
    avatarUrl: string
  ): Promise<AttachmentBuilder> {
    const image = await canvacord.Canvas.youtube({
      username,
      content: reply,
      avatar: await this.circleAvatar(avatarUrl),
      dark: true,
    });
    const attachment = new AttachmentBuilder(image, {
      name: "youtube.png",
    });

    return attachment;
  }

  private async circleAvatar(avatarUrl: string) {
    const avatar = await loadImage(avatarUrl);
    const canvas = createCanvas(avatar.width, avatar.height);
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      canvas.height / 2,
      0,
      Math.PI * 2
    );
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 0, 0);

    return canvas.toBuffer("image/png");
  }
}
