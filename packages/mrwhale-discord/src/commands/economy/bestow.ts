import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
  Message,
  User,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import { EMBED_COLOR } from "../../constants";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "bestow",
      description: "Transfer your gems to another user.",
      type: "economy",
      usage: "<prefix>bestow",
      guildOnly: true,
      cooldown: 3000,
    });
    this.slashCommandData.addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to bestow gems upon.")
        .setRequired(true)
    );
    this.slashCommandData.addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of gems to bestow.")
        .setRequired(true)
    );
  }

  async action(
    message: Message,
    [transferAmount]: [number]
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    const user = message.mentions.users.first();
    const embed = await this.bestow(
      message.author,
      user,
      message.guildId,
      transferAmount
    );

    return message.reply({ embeds: [embed] });
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    const user = interaction.options.getUser("user");
    const transferAmount = interaction.options.getInteger("amount");
    const embed = await this.bestow(
      interaction.user,
      user,
      interaction.guildId,
      transferAmount
    );

    return interaction.reply({ embeds: [embed] });
  }

  private async bestow(
    transferFromUser: User,
    transferToUser: User,
    guildId: string,
    transferAmount: number
  ): Promise<EmbedBuilder> {
    const userBalance = await this.botClient.getUserBalance(
      transferFromUser.id,
      guildId
    );
    const embed = new EmbedBuilder().setColor(EMBED_COLOR);

    if (transferToUser.id === this.botClient.client.user.id) {
      return embed.setDescription(
        `You cannot bestow gems upon me. But thank you.`
      );
    }

    if (transferToUser.bot) {
      return embed.setDescription(`You cannot bestow gems to a bot.`);
    }

    if (transferAmount > userBalance) {
      return embed.setDescription(
        `Sorry, but you only have a balance of ${userBalance} gems.`
      );
    }

    if (transferAmount <= 0) {
      return embed.setDescription(`Please enter an amount greater than zero.`);
    }

    const newBalance = await this.botClient.addToUserBalance(
      transferFromUser.id,
      guildId,
      -transferAmount
    );
    await this.botClient.addToUserBalance(
      transferToUser.id,
      guildId,
      transferAmount
    );

    return embed.setDescription(
      `You have bestowed upon <@${transferToUser.id}> ${transferAmount} gems. Your balance is now ${newBalance}.`
    );
  }
}
