import {
  APIInteractionDataResolvedChannel,
  CacheType,
  ChannelType,
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
  TextChannel,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "levelchannel",
      description: "Set the level up message channel.",
      type: "utility",
      usage: "<prefix>levelchannel <channel>",
      guildOnly: true,
      callerPermissions: ["Administrator"],
    });
    this.slashCommandData.addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to put level up messages in.")
        .setRequired(true)
    );
  }

  async action(
    message: Message
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    const channel = message.mentions.channels.first();

    if (!channel || channel.type !== ChannelType.GuildText) {
      return message.reply("You must pass a text based channel.");
    }

    return this.setLevelChannel(message, channel);
  }

  slashCommandAction(
    interaction: ChatInputCommandInteraction<CacheType>
  ): Promise<unknown> {
    const channel = interaction.options.getChannel("channel");

    if (channel.type !== ChannelType.GuildText) {
      return interaction.reply("You must pass a text based channel.");
    }

    this.setLevelChannel(interaction, channel);
  }

  private async setLevelChannel(
    interaction: Message | ChatInputCommandInteraction,
    channel: TextChannel | APIInteractionDataResolvedChannel
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    const settings = this.botClient.guildSettings.get(interaction.guildId);
    if (settings) {
      settings.set("levelChannel", channel.id);
      return interaction.reply(
        `Successfully set level up channel to <#${channel.id}>`
      );
    }

    return interaction.reply(`Could not set the channel to <#${channel.id}>`);
  }
}
