import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "prefix",
      description: "Sets the bot prefix.",
      type: "utility",
      usage: "<prefix>prefix <prefix>",
      owner: true,
    });
  }

  async action(message: Message, [prefix]: [string]): Promise<Message> {
    try {
      await this.botClient.setPrefix(message.room_id, prefix);
      return message.reply(
        `✅ Successfully set the prefix to "${prefix}" for this room.`,
      );
    } catch (error) {
      return message.reply(`❌ Error setting prefix: ${error.message}`);
    }
  }
}
