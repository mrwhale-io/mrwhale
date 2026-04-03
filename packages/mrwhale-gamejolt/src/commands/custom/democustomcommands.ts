import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "democustomcommands",
      description: "Create demo custom commands to showcase the system.",
      type: "custom",
      aliases: ["demo-custom", "customdemo"],
      usage: "<prefix>democustomcommands",
      owner: true,
      groupOnly: true,
    });
  }

  async action(message: Message): Promise<Message> {
    const demoCommands = [
      {
        name: "greet",
        content: "Hello {user.display_name}! Welcome to {room.title}! 🎉",
        description: "A friendly greeting command",
      },
      {
        name: "mydice",
        content: "🎲 {user.username} rolled a {random(1,6)}!",
        description: "Roll a custom dice (1-6)",
      },
      {
        name: "clocktime",
        content: "⏰ Current time: {time(short)} | Today is {time(date)}",
        description: "Show current time and date",
      },
      {
        name: "coinflip",
        content:
          "🪙 {choose(Heads,Tails)}! {user.display_name} flipped {choose(heads,tails)}.",
        description: "Flip a custom coin",
      },
      {
        name: "8ball",
        content:
          "🎱 {user.display_name} asks the magic 8-ball... {choose(Yes,No,Maybe,Ask again later,Definitely,Probably not,Signs point to yes,Don't count on it,It is certain,Reply hazy try again)}",
        description: "Magic 8-ball responses",
      },
    ];

    try {
      let successCount = 0;
      const errors: string[] = [];

      for (const demo of demoCommands) {
        const result =
          await this.botClient.customCommandManager.createCustomCommand(
            message.room_id,
            message.user.id,
            demo.name,
            demo.description,
            demo.content,
          );

        if (result.success) {
          successCount++;
        } else {
          errors.push(`${demo.name}: ${result.error}`);
        }
      }

      const prefix = await this.botClient.getPrefix(message.room_id);
      let response = `✨ **Demo Custom Commands Created!**\n\n`;

      if (successCount > 0) {
        response += `✅ **Successfully created ${successCount} demo commands:**\n`;
        response += `- \`${prefix}greet\` - Welcome users to the room\n`;
        response += `- \`${prefix}mydice\` - Roll a custom dice (1-6)\n`;
        response += `- \`${prefix}clocktime\` - Show current time and date\n`;
        response += `- \`${prefix}coinflip\` - Flip a custom coin\n`;
        response += `- \`${prefix}8ball\` - Magic 8-ball responses\n\n`;

        response += `**Try them out!**\nThese commands demonstrate various features:\n`;
        response += `- User variables: \`{user.display_name}\`, \`{user.username}\`\n`;
        response += `- Room variables: \`{room.title}\`\n`;
        response += `- Random numbers: \`{random(1,6)}\`\n`;
        response += `- Random choices: \`{choose(option1,option2)}\`\n`;
        response += `- Time functions: \`{time(short)}\`, \`{time(date)}\`\n\n`;

        response += `Use \`${prefix}listcommands\` to see all custom commands.\n`;
        response += `Use \`${prefix}commandinfo <name>\` for detailed info about any command.`;
      }

      if (errors.length > 0) {
        response += `\n\n❌ **Errors:**\n${errors
          .map((e) => `- ${e}`)
          .join("\n")}`;
      }

      return message.reply(response);
    } catch (error) {
      this.botClient.logger.error("Error creating demo commands:", error);
      return message.reply(
        "❌ Failed to create demo commands. Please try again.",
      );
    }
  }
}
