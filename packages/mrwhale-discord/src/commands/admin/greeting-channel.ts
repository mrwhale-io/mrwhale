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
      name: "greetingchannel",
      description: "Set the channel used to greet newly joined guild members.",
      type: "admin",
      usage: "<prefix>greetingchannel <channel>",
      guildOnly: true,
      callerPermissions: ["Administrator"],
    });
    this.slashCommandData.addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The greeting channel.")
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

    return this.setGreetingChannel(message, channel);
  }

  slashCommandAction(
    interaction: ChatInputCommandInteraction<CacheType>
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    const channel = interaction.options.getChannel("channel");

    if (channel.type !== ChannelType.GuildText) {
      return interaction.reply("You must pass a text based channel.");
    }

    return this.setGreetingChannel(interaction, channel);
  }

  private async setGreetingChannel(
    interaction: Message | ChatInputCommandInteraction,
    channel: TextChannel | APIInteractionDataResolvedChannel
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    const settings = this.botClient.guildSettings.get(interaction.guildId);
    if (settings) {
      settings.set("greetingChannel", channel.id);
      return interaction.reply(
        `Successfully set greeting channel to <#${channel.id}>`
      );
    }

    return interaction.reply(
      `Could not set the greeting channel to <#${channel.id}>`
    );
  }
}
