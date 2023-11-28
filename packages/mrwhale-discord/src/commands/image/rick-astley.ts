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
      name: "rickastley",
      description: "Places your avatar on Rick Astley.",
      type: "image",
      usage: "<prefix>rickastley @user",
      cooldown: 5000,
      aliases: ["rick", "rickroll"],
      clientPermissions: ["AttachFiles"],
    });
    this.slashCommandData.addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user's avatar to put on Rick Astley.")
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
    const rick = await loadImage(
      path.join(__dirname, "..", "..", "..", "images", "Rick-astley.png")
    );
    const avatar = await loadImage(avatarFile.data);
    const canvas = createCanvas(rick.width, rick.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(rick, 0, 0);
    const ratio = rick.height / 3 / avatar.height;
    const width = avatar.width * ratio;
    ctx.drawImage(
      avatar,
      width + width / 2,
      avatar.height / 4,
      width,
      rick.height / 3
    );

    const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
      name: "Rick-astley.png",
    });

    return attachment;
  }
}
