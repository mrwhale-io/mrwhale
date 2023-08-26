import { ping } from "@mrwhale-io/commands";
import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(ping.data);
  }

  async action(message: Message): Promise<Message> {
    console.log("ping")
    return message.reply(ping.action());
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<InteractionResponse<boolean>> {
    return interaction.reply(ping.action());
  }
}
