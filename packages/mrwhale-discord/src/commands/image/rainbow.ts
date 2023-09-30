import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  Message,
} from "discord.js";
import * as canvacord from "canvacord";

import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "rainbow",
      description: "Puts a rainbow over the provided user avatar.",
      type: "image",
      usage: "<prefix>rainbow [@user]",
      aliases: ["gay", "lgbt", "pride"],
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
    const image = await canvacord.Canvas.rainbow(avatarUrl);
    const attachment = new AttachmentBuilder(image, {
      name: "rainbow.png",
    });

    return attachment;
  }
}
