import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  Message,
} from "discord.js";
import * as canvacord from "canvacord";

import { DiscordCommand } from "../../client/command/discord-command";
import { AVATAR_OPTIONS } from "../../constants";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "spank",
      description: "Spank another member in the server.",
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
    const firstUser =
      message.mentions.users.size === 1
        ? message.author
        : message.mentions.users.first();

    const secondUser =
      message.mentions.users.size === 1
        ? message.mentions.users.first()
        : message.mentions.users.at(1);

    if (!firstUser || !secondUser) {
      return message.reply("Please pass a user.");
    }

    const responseMsg = await message.reply("Processing please wait...");
    const attachment = await this.generateImage(
      firstUser.displayAvatarURL(AVATAR_OPTIONS),
      secondUser.displayAvatarURL(AVATAR_OPTIONS)
    );
    return responseMsg.edit({ files: [attachment], content: null });
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    await interaction.deferReply();
    const firstUser = interaction.options.getUser("second")
      ? interaction.options.getUser("first")
      : interaction.user;

    const secondUser = interaction.options.getUser("second")
      ? interaction.options.getUser("second")
      : interaction.options.getUser("first");

    const attachment = await this.generateImage(
      firstUser.displayAvatarURL(AVATAR_OPTIONS),
      secondUser.displayAvatarURL(AVATAR_OPTIONS)
    );

    interaction.editReply({ files: [attachment] });
  }

  private async generateImage(
    firstAvatarUrl: string,
    secondAvatarUrl: string
  ): Promise<AttachmentBuilder> {
    const image = await canvacord.Canvas.spank(firstAvatarUrl, secondAvatarUrl);
    const attachment = new AttachmentBuilder(image, {
      name: "spank.png",
    });

    return attachment;
  }
}
