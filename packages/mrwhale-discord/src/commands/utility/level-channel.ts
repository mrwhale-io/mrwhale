import { Message } from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "levelchannel",
      description: "Set the level up announcement channel.",
      type: "utility",
      usage: "<prefix>level channel <channel>",
      guildOnly: true,
      callerPermissions: ["ADMINISTRATOR"],
    });
  }

  async action(message: Message): Promise<void | Message<boolean>> {
    const settings = this.botClient.guildSettings.get(message.guildId);
    const channel = message.mentions.channels.first();
    if (!channel.isText()) {
      return message.reply("You must pass a text based channel.");
    }

    if (settings) {
      settings.set("levelChannel", channel.id);
      return message.reply(
        `Successfully set level up channel to <#${channel.id}>`
      );
    }

    return message.reply(`Could not set the channel to <#${channel.id}`);
  }
}
