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
      name: "spank",
      description: "Spank.",
      type: "image",
      usage: "<prefix>spank <@user1> <@user2>",
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
    const baseUser = message.mentions.users.first();
    const overlayUser = message.mentions.users.at(1) || message.author;
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
      secondUser.displayAvatarURL({ extension: "png", size: 512 }),
      firstUser.displayAvatarURL({ extension: "png", size: 512 })
    );

    interaction.editReply({ files: [attachment] });
  }

  private async generateImage(
    firstAvatarUrl: string,
    secondAvatarUrl: string
  ): Promise<AttachmentBuilder> {
    const image = await canvacord.Canvas.spank(firstAvatarUrl, secondAvatarUrl);
    const attachment = new AttachmentBuilder(image, {
      name: "triggered.gif",
    });

    return attachment;
  }
}
