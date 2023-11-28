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
      name: "christmashat",
      description: "Edits an avatar to have a christmas hat.",
      type: "image",
      usage: "<prefix>christmashat @user",
      aliases: ["santahat"],
      cooldown: 5000,
      clientPermissions: ["AttachFiles"],
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
      user.displayAvatarURL(AVATAR_OPTIONS)
    );

    return responseMsg.edit({ files: [attachment], content: null });
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const user = interaction.options.getUser("user") || interaction.user;
    await interaction.deferReply();
    const attachment = await this.generateImage(
      user.displayAvatarURL(AVATAR_OPTIONS)
    );

    interaction.editReply({ files: [attachment] });
  }

  private async generateImage(avatarUrl: string): Promise<AttachmentBuilder> {
    const avatarFile = await axios.get(avatarUrl, {
      responseType: "arraybuffer",
    });
    const base = await loadImage(
      path.join(__dirname, "..", "..", "..", "images", "christmas-hat.png")
    );
    const avatar = await loadImage(avatarFile.data);
    const canvas = createCanvas(avatar.width, avatar.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(avatar, 0, 0);

    const ratio = avatar.height / base.height;
    const width = base.width * ratio;
    ctx.drawImage(
      base,
      avatar.width - width / 1.3,
      0 - avatar.height / 4,
      width,
      avatar.height
    );

    const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
      name: "christmas-hat.png",
    });

    return attachment;
  }
}
