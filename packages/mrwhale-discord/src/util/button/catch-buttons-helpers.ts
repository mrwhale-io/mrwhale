import {
  ActionRowBuilder,
  ButtonBuilder,
  Interaction,
  Message,
} from "discord.js";

import { Buttons } from "../../types/button/buttons";
import { DiscordBotClient } from "../../client/discord-bot-client";

/**
 * Creates the button for the catch command.
 */
export function createCatchButtons(
  interaction: Interaction | Message,
  botClient: DiscordBotClient
): ActionRowBuilder<ButtonBuilder> {
  const userId = interaction.member.user.id;
  const oceanHandler = botClient.buttons.get(Buttons.Ocean);
  const oceanButton = oceanHandler.getButtonBuilder(userId);
  const catchHandler = botClient.buttons.get(Buttons.Catch);
  const catchButton = catchHandler.getButtonBuilder(userId);
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    catchButton,
    oceanButton
  );

  return row;
}
