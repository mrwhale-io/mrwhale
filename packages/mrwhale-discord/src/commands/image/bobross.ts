import axios from "axios";
import {
  ChatInputCommandInteraction,
  Message,
  AttachmentBuilder,
  Attachment,
} from "discord.js";
import { createCanvas, loadImage } from "canvas";
import * as path from "path";

import { DiscordCommand } from "../../client/command/discord-command";
import { AVATAR_OPTIONS } from "../../constants";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "bobross",
      description: "Paint a happy little picture with Bob Ross.",
      type: "image",
      usage: "<prefix>bobross [attachment]",
      cooldown: 5000,
      clientPermissions: ["AttachFiles"],
    });
    this.slashCommandData.addAttachmentOption((option) =>
      option.setName("image").setDescription("The image attachment to edit.")
    );
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
  ): Promise<Message<boolean>> {
    await interaction.deferReply();
    const imageAttachment = interaction.options.getAttachment("image");
    const contentTypes = ["image/jpeg", "image/png"];
    if (
      imageAttachment &&
      !contentTypes.some((c) => imageAttachment.contentType.includes(c))
    ) {
      return interaction.editReply(
        "Attachment must be either a PNG or a JPEG."
      );
    }

    const attachment = await this.generateImage(
      interaction.user.displayAvatarURL(AVATAR_OPTIONS),
      imageAttachment
    );

    interaction.editReply({ files: [attachment] });
  }

  private async generateImage(
    avatarUrl: string,
    imageAttachment?: Attachment
  ): Promise<AttachmentBuilder> {
    const imageData = await axios.get(
      imageAttachment ? imageAttachment.url : avatarUrl,
      {
        responseType: "arraybuffer",
      }
    );

    const loadedImage = await loadImage(imageData.data);
    const bobross = await loadImage(
      path.join(__dirname, "..", "..", "..", "images", "bobross.png")
    );
    const canvas = createCanvas(bobross.width, bobross.height);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = `white`;
    ctx.fillRect(0, 0, bobross.width, bobross.height);
    ctx.drawImage(loadedImage, 15, 20, 440, 440);
    ctx.drawImage(bobross, 0, 0);

    const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
      name: "bobross.png",
    });

    return attachment;
  }
}
