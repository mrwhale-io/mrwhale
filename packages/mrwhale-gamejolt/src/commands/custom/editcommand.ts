import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "editcommand",
      description: "Edit an existing custom command in this room.",
      type: "custom",
      aliases: ["edit-command", "modifycommand", "cedit"],
      usage: "<prefix>editcommand <name>, <new_content>",
      examples: [
        "editcommand greet, Welcome {user.display_name}! Thanks for joining {room.title}!",
        "editcommand info, Updated information: This room is for discussions.",
      ],
      owner: true,
      groupOnly: true,
      cooldown: 60000,
    });
  }

  async action(message: Message, args: string[]): Promise<Message> {
    if (args.length < 2) {
      const prefix = await this.botClient.getPrefix(message.room_id);
      return message.reply(
        `❌ **Usage:** \`${prefix}editcommand <name>, <new_content>\`\n\n` +
          "**Template Variables:**\n" +
          "- `{user.username}` - User's username\n" +
          "- `{user.display_name}` - User's display name\n" +
          "- `{room.title}` - Room title\n" +
          "- `{args}` - Command arguments\n" +
          "- `{timestamp}` - Current timestamp\n" +
          "- `{bot.name}` - Bot name\n\n" +
          `Use \`${prefix}listcommands\` to see available custom commands`,
      );
    }

    const commandName = args[0].toLowerCase();
    const newContent = args.slice(1).join(" ");

    if (!newContent.trim()) {
      return message.reply("❌ Command content cannot be empty.");
    }

    try {
      const result =
        await this.botClient.customCommandManager.updateCustomCommand(
          message.room_id,
          message.user.id,
          commandName,
          { content: newContent },
        );

      if (!result.success) {
        return message.reply(`❌ ${result.error}`);
      }

      const prefix = await this.botClient.getPrefix(message.room_id);
      const oldContent = result.oldValues?.content || "";

      return message.reply(
        `✅ **Custom command updated successfully!**\n\n` +
          `**Command:** \`${prefix}${commandName}\`\n` +
          `**Old Content:** ${
            oldContent.length > 100
              ? oldContent.substring(0, 100) + "..."
              : oldContent
          }\n` +
          `**New Content:** ${newContent}\n\n` +
          `The command has been updated and is ready to use.`,
      );
    } catch (error) {
      this.botClient.logger.error("Error editing custom command:", error);
      return message.reply("❌ Failed to edit command. Please try again.");
    }
  }
}
