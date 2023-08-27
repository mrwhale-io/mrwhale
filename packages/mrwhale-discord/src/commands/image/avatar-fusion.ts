import axios from "axios";
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
      name: "avatarfusion",
      description: "Fuses two user avatars together.",
      type: "image",
      usage: "<prefix>avatarfusion <@user1> <@user2>",
      aliases: ["fuse", "fusion"],
      cooldown: 5000,
      clientPermissions: ["AttachFiles"],
    });
    this.slashCommandData.addUserOption((option) =>
      option
        .setName("first")
        .setDescription("The first user.")
        .setRequired(true)
    );
    this.slashCommandData.addUserOption((option) =>
      option
        .setName("second")
        .setDescription("The second user.")
        .setRequired(false)
    );
  }

  async action(message: Message): Promise<void | Message> {
    const overlayUser = message.mentions.users.first();
    const baseUser = message.mentions.users.at(1) || message.author;
    if (!overlayUser) {
      return message.reply("Please mention a user.");
    }

    const responseMsg = await message.reply("Processing please wait...");
    const attachment = await this.generateImage(
      baseUser.displayAvatarURL({ extension: "png", size: 512 }),
      overlayUser.displayAvatarURL({ extension: "png", size: 512 })
    );
    return responseMsg.edit({ files: [attachment], content: null });
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    await interaction.deferReply();
    const firstUser = interaction.options.getUser("first");
    const secondUser =
      interaction.options.getUser("second") || interaction.user;
    const attachment = await this.generateImage(
      firstUser.displayAvatarURL({ extension: "png", size: 512 }),
      secondUser.displayAvatarURL({ extension: "png", size: 512 })
    );

    interaction.editReply({ files: [attachment] });
  }

  private async generateImage(
    firstAvatarUrl: string,
    secondAvatarUrl: string
  ): Promise<AttachmentBuilder> {
    const baseAvatarFile = await axios.get(firstAvatarUrl, {
      responseType: "arraybuffer",
    });
    const overlayAvatarFile = await axios.get(secondAvatarUrl, {
      responseType: "arraybuffer",
    });

    const avatar = await loadImage(baseAvatarFile.data);
    const secondAvatar = await loadImage(overlayAvatarFile.data);

    const canvas = createCanvas(avatar.width, avatar.height);
    const ctx = canvas.getContext("2d");
    ctx.globalAlpha = 0.5;
    ctx.drawImage(avatar, 0, 0);
    ctx.drawImage(secondAvatar, 0, 0, avatar.width, avatar.height);

    const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
      name: "fused.png",
    });

    return attachment;
  }
}
