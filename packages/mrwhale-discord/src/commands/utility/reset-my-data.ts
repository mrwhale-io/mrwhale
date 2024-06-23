import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
  DiscordjsError,
  DiscordjsErrorCodes,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import { resetUserData } from "../../database/services/user";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "resetmydata",
      description: "Resets your user data.",
      type: "utility",
      usage: "<prefix>resetmydata",
    });
    this.slashCommandData.addBooleanOption((option) =>
      option
        .setName("global")
        .setDescription("Whether to reset your data across all servers.")
        .setRequired(false)
    );
  }

  async action(_message: Message): Promise<void> {}

  async slashCommandAction(
    interaction: ChatInputCommandInteraction<CacheType>
  ): Promise<InteractionResponse<boolean> | Message<boolean>> {
    const userId = interaction.user.id;
    const confirm = new ButtonBuilder()
      .setCustomId("confirm")
      .setLabel("Reset Data")
      .setStyle(ButtonStyle.Danger);

    const cancel = new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      cancel,
      confirm
    );

    const response = await interaction.reply({
      ephemeral: true,
      content: `Are you sure you want to reset your user data? This action is irreversible.`,
      components: [row],
    });

    const collectorFilter = (i: any) => i.user.id === userId;
    try {
      const confirmation = await response.awaitMessageComponent({
        filter: collectorFilter,
        time: 60_000,
      });

      if (confirmation.customId === "confirm") {
        const isGlobal = interaction.options.getBoolean("global") || false;

        isGlobal
          ? await resetUserData(userId)
          : await resetUserData(userId, interaction.guildId);

        return await confirmation.update({
          content: `Your user data has been reset.`,
          components: [],
        });
      } else if (confirmation.customId === "cancel") {
        return await confirmation.update({
          content: "Action cancelled.",
          components: [],
        });
      }
    } catch (error) {
      if (
        error instanceof DiscordjsError &&
        error.code === DiscordjsErrorCodes.InteractionCollectorError
      ) {
        return await interaction.editReply({
          content: "Confirmation not received within 1 minute, cancelling.",
          components: [],
        });
      }

      return await interaction.editReply({
        content: "An error occurred while resetting user data.",
        components: [],
      });
    }
  }
}
