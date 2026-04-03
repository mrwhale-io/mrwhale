import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "togglecommand",
      description: "Enable or disable a custom command in this room.",
      type: "custom",
      aliases: ["toggle-command", "ctoggle"],
      usage: "<prefix>togglecommand <name>, [on|off]",
      examples: [
        "togglecommand greet, off",
        "togglecommand welcome, on",
        "togglecommand dice", // Toggle current state
      ],
      owner: true,
      groupOnly: true,
      cooldown: 60000,
    });
  }

  async action(message: Message, args: string[]): Promise<Message> {
    if (args.length === 0) {
      const prefix = await this.botClient.getPrefix(message.room_id);
      return message.reply(
        `❌ **Usage:** \`${prefix}togglecommand <name> [on|off]\`\n\n` +
          `**Examples:**\n` +
          `• \`${prefix}togglecommand greet, off\` - Disable the greet command\n` +
          `• \`${prefix}togglecommand welcome, on\` - Enable the welcome command\n` +
          `• \`${prefix}togglecommand dice\` - Toggle the dice command\n\n` +
          `Use \`${prefix}listcommands\` to see available custom commands.`,
      );
    }

    const commandName = args[0].toLowerCase();
    const action = args.length > 1 ? args[1].toLowerCase() : null;

    try {
      // First get the current command to determine new state
      const currentCommand =
        await this.botClient.customCommandManager.getCommand(
          message.room_id,
          commandName,
        );

      if (!currentCommand) {
        const prefix = await this.botClient.getPrefix(message.room_id);
        return message.reply(
          `❌ Custom command \`${commandName}\` not found.\n\n` +
            `Use \`${prefix}listcommands\` to see available commands.`,
        );
      }

      // Determine new state
      let newState: boolean;
      if (action === "on" || action === "enable" || action === "true") {
        newState = true;
      } else if (
        action === "off" ||
        action === "disable" ||
        action === "false"
      ) {
        newState = false;
      } else {
        // Toggle current state
        newState = !currentCommand.enabled;
      }

      // Update the command
      const result =
        await this.botClient.customCommandManager.updateCustomCommand(
          message.room_id,
          message.user.id,
          commandName,
          { enabled: newState },
        );

      if (!result.success) {
        return message.reply(`❌ ${result.error}`);
      }

      const oldState = result.oldValues?.enabled ?? false;
      const statusIcon = newState ? "✅" : "❌";
      const statusText = newState ? "enabled" : "disabled";
      const changeText =
        oldState === newState
          ? `already ${statusText}`
          : `${oldState ? "enabled" : "disabled"} → ${statusText}`;

      const prefix = await this.botClient.getPrefix(message.room_id);
      return message.reply(
        `${statusIcon} **Custom command toggled!**\n\n` +
          `**Command:** \`${prefix}${commandName}\`\n` +
          `**Status:** ${changeText}\n\n` +
          `${
            newState
              ? `The command is now active and ready to use.`
              : `The command is now disabled and won't respond to triggers.`
          }`,
      );
    } catch (error) {
      this.botClient.logger.error("Error toggling custom command:", error);
      return message.reply("❌ Failed to toggle command. Please try again.");
    }
  }
}
