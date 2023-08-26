import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";

const PREFIX_LENGTH = 10;

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "prefix",
      description: "Sets the bot prefix.",
      type: "utility",
      usage: "<prefix>prefix <prefix>",
      callerPermissions: ["Administrator"],
    });
    this.slashCommandData.addStringOption((option) =>
      option
        .setName("prefix")
        .setDescription("The new command prefix.")
        .setRequired(true)
    );
  }

  async action(message: Message, [prefix]: [string]): Promise<Message> {
    return message.reply(this.setPrefix(prefix, message.guildId));
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<InteractionResponse<boolean>> {
    const prefix = interaction.options.getString("prefix");

    return interaction.reply(this.setPrefix(prefix, interaction.guildId));
  }

  private setPrefix(prefix: string, guildId: string) {
    if (!prefix) {
      return "Please provide a prefix";
    }

    if (prefix.length > PREFIX_LENGTH) {
      return `Please provide a prefix less than ${PREFIX_LENGTH} characters.`;
    }

    const settings = this.botClient.guildSettings.get(guildId);

    if (settings) {
      settings.set("prefix", prefix);
      return "Successfully set the prefix for this server.";
    } else {
      return "Could not set prefix for this server.";
    }
  }
}
