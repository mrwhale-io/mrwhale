import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import { LevelManager } from "../../client/managers/level-manager";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "resetmydata",
      description: "Reset all your data.",
      type: "utility",
      usage: "<prefix>resetmydata",
    });
  }

  async action(_message: Message): Promise<void> {}

  async slashCommandAction(
    interaction: ChatInputCommandInteraction<CacheType>
  ): Promise<InteractionResponse<boolean>> {
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
      content: `Are you sure you want to reset all your user data?`,
      components: [row],
    });

    const collectorFilter = (i: any) => i.user.id === interaction.user.id;
    try {
      const confirmation = await response.awaitMessageComponent({
        filter: collectorFilter,
        time: 60_000,
      });

      if (confirmation.customId === "confirm") {
        await LevelManager.removeAllScoresForUser(interaction.member.user.id);
        await confirmation.update({
          content: `Your user data has been reset.`,
          components: [],
        });
      } else if (confirmation.customId === "cancel") {
        return await confirmation.update({
          content: "Action cancelled.",
          components: [],
        });
      }
    } catch {
      await interaction.editReply({
        content: "Confirmation not received within 1 minute, cancelling.",
        components: [],
      });
    }
  }
}
