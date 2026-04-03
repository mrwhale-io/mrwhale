import { Message } from "@mrwhale-io/gamejolt-client";
import { TimeUtilities } from "@mrwhale-io/core";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { CustomCommand } from "../../types/custom-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "commandcooldowns",
      description: "Check cooldown status of custom commands.",
      type: "custom",
      aliases: ["cmd-cooldowns", "cooldowns", "cd"],
      usage: "<prefix>commandcooldowns [command]",
      examples: ["commandcooldowns", "commandcooldowns greet"],
      groupOnly: true,
      cooldown: 5000,
    });
  }

  async action(message: Message, args: string[]): Promise<Message> {
    try {
      const enabledCommands =
        await this.botClient.customCommandManager.getEnabledCommands(
          message.room_id,
        );

      if (enabledCommands.length === 0) {
        const prefix = await this.botClient.getPrefix(message.room_id);
        return message.reply(
          `📝 **No custom commands found.**\n\n` +
            `Use \`${prefix}listcommands\` to view commands or \`${prefix}createcommand\` to create one.`,
        );
      }

      // Check specific command
      if (args.length > 0) {
        const targetCommand = args[0].toLowerCase();
        const command = enabledCommands.find(
          (cmd) =>
            cmd.name === targetCommand || cmd.aliases.includes(targetCommand),
        );

        if (!command) {
          return message.reply(
            `❓ **Command not found:** \`${targetCommand}\`\n\n` +
              `Use \`${this.name}\` without arguments to see all commands.`,
          );
        }

        return this.showSingleCommandCooldown(message, command);
      }

      // Show all commands with cooldown info
      return this.showAllCommandCooldowns(message, enabledCommands);
    } catch (error) {
      this.botClient.logger.error("Error checking command cooldowns:", error);
      return message.reply(
        "❌ **Failed to check cooldowns.** Please try again.",
      );
    }
  }

  private async showSingleCommandCooldown(
    message: Message,
    command: CustomCommand,
  ): Promise<Message> {
    const prefix = await this.botClient.getPrefix(message.room_id);
    const { rateLimiter } = this.botClient.customCommandManager;
    const remainingMs = rateLimiter.getRemainingCooldown(
      message,
      command.name,
      command.cooldown,
    );

    let response = `⏱️ **${prefix}${command.name} Cooldown Status**\n\n`;
    response += `**Cooldown Duration:** ${TimeUtilities.convertMs(
      command.cooldown,
    )}\n`;

    if (remainingMs > 0) {
      response += `**Status:** 🔴 On cooldown\n`;
      response += `**Time Remaining:** ${TimeUtilities.convertMs(
        remainingMs,
      )}\n`;
    } else {
      response += `**Status:** 🟢 Ready to use\n`;
    }

    response += `\n**Usage Count:** ${command.usageCount} times\n`;
    response += `**Created:** ${command.createdAt.toLocaleDateString()}`;

    return message.reply(response);
  }

  private async showAllCommandCooldowns(
    message: Message,
    commands: CustomCommand[],
  ): Promise<Message> {
    const prefix = await this.botClient.getPrefix(message.room_id);
    const { rateLimiter } = this.botClient.customCommandManager;

    let response = `⏱️ **Custom Command Cooldowns**\n\n`;

    // Group commands by cooldown status
    const readyCommands: CustomCommand[] = [];
    const cooldownCommands: { command: CustomCommand; remaining: number }[] =
      [];

    commands.forEach((cmd) => {
      const remainingMs = rateLimiter.getRemainingCooldown(
        message,
        cmd.name,
        cmd.cooldown,
      );
      if (remainingMs > 0) {
        cooldownCommands.push({ command: cmd, remaining: remainingMs });
      } else {
        readyCommands.push(cmd);
      }
    });

    // Show ready commands
    if (readyCommands.length > 0) {
      response += `🟢 **Ready (${readyCommands.length}):**\n`;
      readyCommands.slice(0, 8).forEach((cmd) => {
        const cooldownText =
          cmd.cooldown > 0 ? ` (${TimeUtilities.convertMs(cmd.cooldown)})` : "";
        response += `• \`${prefix}${cmd.name}\`${cooldownText}\n`;
      });
      if (readyCommands.length > 8) {
        response += `  *...and ${readyCommands.length - 8} more*\n`;
      }
      response += `\n`;
    }

    // Show commands on cooldown
    if (cooldownCommands.length > 0) {
      response += `🔴 **On Cooldown (${cooldownCommands.length}):**\n`;
      cooldownCommands.slice(0, 5).forEach(({ command: cmd, remaining }) => {
        response += `• \`${prefix}${cmd.name}\` - ${TimeUtilities.convertMs(
          remaining,
        )} left\n`;
      });
      if (cooldownCommands.length > 5) {
        response += `  *...and ${cooldownCommands.length - 5} more*\n`;
      }
      response += `\n`;
    }

    if (commands.length === 0) {
      response += `💡 All commands are ready to use!\n\n`;
    }

    response += `**💡 Tip:** Use \`${prefix}commandcooldowns <name>\` for detailed info about a specific command.`;

    return message.reply(response);
  }
}
