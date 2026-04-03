import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "deletecommand",
      description: "Delete a custom command from this room.",
      type: "custom",
      aliases: ["delete-command", "removecommand", "delcommand"],
      usage: "<prefix>deletecommand <name>",
      examples: ["deletecommand greet", "deletecommand welcome"],
      groupOnly: true,
      cooldown: 5000,
    });
  }

  async action(message: Message, args: string[]): Promise<Message> {
    if (args.length === 0) {
      const prefix = await this.botClient.getPrefix(message.room_id);
      return message.reply(
        `❌ **Usage:** \`${prefix}deletecommand <name>\`\n\n` +
          `Use \`${prefix}listcommands\` to see available commands.`,
      );
    }

    const commandName = args[0].toLowerCase();

    try {
      const result =
        await this.botClient.customCommandManager.deleteCustomCommand(
          message.room_id,
          message.user.id,
          commandName,
        );

      if (!result.success) {
        const prefix = await this.botClient.getPrefix(message.room_id);
        return message.reply(
          `❌ ${result.error}\n\n` +
            `Use \`${prefix}listcommands\` to see available commands.`,
        );
      }

      const roomCommands =
        await this.botClient.customCommandManager.getRoomCustomCommands(
          message.room_id,
        );
      let response = `✅ **Command deleted successfully!**\n\n`;
      response += `**Deleted:** \`${commandName}\`\n`;
      response += `**Usage Count:** ${result.command!.usageCount} times\n`;
      response += `**Commands Remaining:** ${roomCommands.commands.size}/${roomCommands.limits.maxCommands}`;

      return message.reply(response);
    } catch (error) {
      this.botClient.logger.error("Error deleting custom command:", error);
      return message.reply(
        "❌ **Failed to delete command.** Please try again.",
      );
    }
  }
}
