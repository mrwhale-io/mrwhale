import { dadjoke } from "@mrwhale-io/commands";
import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(dadjoke.data);
  }

  async action(message: Message): Promise<Message> {
    return message.reply(await dadjoke.action());
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<InteractionResponse<boolean>> {
    return interaction.reply(await dadjoke.action());
  }
}
