import {
  ChatInputCommandInteraction,
  Message,
  EmbedBuilder,
  InteractionResponse,
  User,
} from "discord.js";

import { ship } from "@mrwhale-io/commands";
import { DiscordCommand } from "../../client/command/discord-command";
import { createEmbed } from "../../util/embed/create-embed";

export default class extends DiscordCommand {
  constructor() {
    super(ship.data);
    this.slashCommandData.addMentionableOption((option) =>
      option
        .setName("first")
        .setDescription("The first user.")
        .setRequired(true)
    );
    this.slashCommandData.addMentionableOption((option) =>
      option
        .setName("second")
        .setDescription("The second user.")
        .setRequired(true)
    );
  }

  async action(message: Message): Promise<Message> {
    const firstUser = message.mentions.users.at(0);
    const secondUser = message.mentions.users.at(1);

    if (!firstUser || !secondUser) {
      return message.reply("Please mention two users to ship.");
    }

    const result = ship.action(firstUser.displayName, secondUser.displayName);
    const embed = this.createShipEmbed(result, firstUser, secondUser);

    return message.reply({ embeds: [embed] });
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<InteractionResponse<boolean>> {
    const first = interaction.options.getMentionable("first") as User;
    const second = interaction.options.getMentionable("second") as User;
    const result = ship.action(first.displayName, second.displayName);
    const embed = this.createShipEmbed(result, first, second);

    return interaction.reply({
      embeds: [embed],
      allowedMentions: { users: [] },
    });
  }

  /**
   * Creates an embed for the ship result.
   */
  private createShipEmbed(
    result: ship.ShipResult,
    firstUser: User,
    secondUser: User
  ): EmbedBuilder {
    return createEmbed(
      `Let's see how compatible <@${firstUser.id}> and <@${secondUser.id}> are!`
    )
      .setTitle("💘 Compatibility Results 💘")
      .addFields(
        { name: "Compatibility", value: `${result.percent}%`, inline: true },
        { name: "Ship Name", value: result.shipName, inline: true },
        {
          name: "Match Description",
          value: result.description,
          inline: false,
        },
        { name: "Prediction", value: result.prediction, inline: false },
        {
          name: "Compatibility Breakdown",
          value: result.breakdown,
          inline: false,
        },
        { name: "Fun Fact", value: result.randomFact, inline: false }
      )
      .addFields({
        name: "Compatibility Scale",
        value: result.emojiScale,
        inline: false,
      })
      .setFooter({
        text: "For entertainment purposes only ❤️",
      })
      .setTimestamp();
  }
}
