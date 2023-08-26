import { fact } from "@mrwhale-io/commands";
import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(fact.data);
  }

  async action(message: Message): Promise<Message> {
    return message.reply(await fact.action());
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<InteractionResponse<boolean>> {
    return interaction.reply(await fact.action());
  }
}
