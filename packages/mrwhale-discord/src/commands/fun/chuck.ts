import { chuck } from "@mrwhale-io/commands";
import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(chuck.data);
  }

  async action(
    message: Message,
    [firstName, lastName, category]: [string, string, string]
  ): Promise<Message> {
    return message.reply(await chuck.action());
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<InteractionResponse<boolean>> {
    return interaction.reply(await chuck.action());
  }
}
