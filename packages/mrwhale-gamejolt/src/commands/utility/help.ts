import { InfoBuilder, TimeUtilities } from "@mrwhale-io/core";
import type { CommandTypes } from "@mrwhale-io/core";
import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "help",
      description: "Get command help and discover available features.",
      type: "utility",
      usage: "<prefix>help [type|command|premium]",
      examples: ["help", "help effects", "help hologram", "help premium"],
      cooldown: 5000,
    });
  }

  async action(message: Message, [typeOrCmdName]: [string]): Promise<Message> {
    const prefix = await this.botClient.getPrefix(message.room_id);

    // Get all available command types dynamically
    const allCommands = Array.from(this.botClient.commands.values());
    const availableTypes = [
      ...new Set(allCommands.map((cmd) => cmd.type)),
    ].sort();

    if (typeOrCmdName) {
      // Special case for premium help
      if (typeOrCmdName.toLowerCase() === "premium") {
        return this.showPremiumHelp(message, prefix);
      }

      // Show specific command help
      const cmd = this.botClient.commands.findByNameOrAlias(typeOrCmdName);
      if (cmd) {
        return this.showCommandHelp(message, cmd, prefix);
      }

      // Show commands by type
      if (
        availableTypes.includes(typeOrCmdName.toLowerCase() as CommandTypes)
      ) {
        const commands = Array.from(
          this.botClient.commands.findByType(typeOrCmdName).values(),
        );
        return this.showTypeHelp(message, typeOrCmdName, commands, prefix);
      }

      return message.reply(
        "❌ Could not find this command or type. Use `!help` to see all categories.",
      );
    }

    // Show main help menu
    return this.showMainHelp(message, availableTypes, prefix);
  }

  private async showCommandHelp(
    message: Message,
    cmd: GameJoltCommand,
    prefix: string,
  ): Promise<Message> {
    const info = new InfoBuilder()
      .addField("📝 Name", cmd.name)
      .addField("📋 Description", cmd.description)
      .addField("📁 Type", this.getTypeDisplay(cmd.type))
      .addField(
        "⏱️ Cooldown",
        `${TimeUtilities.convertMs(cmd.rateLimiter.duration)}`,
      );

    // Add premium information
    if (cmd.requiresPremium || cmd.premium) {
      const tier = cmd.premiumTier || "premium";
      const tierEmoji = tier === "pro" ? "💎" : "⭐";
      info.addField(
        `${tierEmoji} Premium`,
        `Requires ${tier.toUpperCase()} subscription`,
      );
    }

    if (cmd.examples.length > 0) {
      info.addField("💡 Examples", cmd.examples.join(", "));
    }

    if (cmd.aliases.length > 0) {
      info.addField("🔗 Aliases", cmd.aliases.join(", "));
    }

    let helpText = info.build().replace(/<prefix>/g, prefix);

    // Add subscription prompt for premium commands
    if (cmd.requiresPremium || cmd.premium) {
      helpText += `\n\n💡 **Need ${
        cmd.premiumTier || "premium"
      } access?** Use \`${prefix}subscribe\` to upgrade!`;
    }

    return message.reply(helpText);
  }

  private async showTypeHelp(
    message: Message,
    type: string,
    commands: GameJoltCommand[],
    prefix: string,
  ): Promise<Message> {
    const typeDisplay = this.getTypeDisplay(type);
    const freeCommands = commands.filter(
      (cmd) => !cmd.requiresPremium && !cmd.premium,
    );
    const premiumCommands = commands.filter(
      (cmd) => cmd.requiresPremium || cmd.premium,
    );

    let helpText = `📁 **${typeDisplay}**\n\n`;
    const maxLength = 900; // Leave room for footer

    if (freeCommands.length > 0) {
      helpText += "🆓 **Free:**\n";
      const freeList = this.formatCommandList(
        freeCommands,
        prefix,
        maxLength - helpText.length - 200,
      );
      helpText += freeList.text;
      if (freeList.truncated > 0) {
        helpText += `\n  *...and ${freeList.truncated} more*`;
      }
    }

    if (premiumCommands.length > 0) {
      if (freeCommands.length > 0) helpText += "\n\n";

      const premiumCmds = premiumCommands.filter(
        (cmd) => (cmd.premiumTier || "premium") === "premium",
      );
      const proCmds = premiumCommands.filter(
        (cmd) => cmd.premiumTier === "pro",
      );

      if (premiumCmds.length > 0 && helpText.length < maxLength - 100) {
        helpText += "⭐ **Premium:**\n";
        const premiumList = this.formatCommandList(
          premiumCmds,
          prefix,
          maxLength - helpText.length - 100,
        );
        helpText += premiumList.text;
        if (premiumList.truncated > 0) {
          helpText += `\n  *...and ${premiumList.truncated} more*`;
        }
      }

      if (proCmds.length > 0 && helpText.length < maxLength - 100) {
        if (premiumCmds.length > 0) helpText += "\n\n";
        helpText += "💎 **Pro:**\n";
        const proList = this.formatCommandList(
          proCmds,
          prefix,
          maxLength - helpText.length - 50,
        );
        helpText += proList.text;
        if (proList.truncated > 0) {
          helpText += `\n  *...and ${proList.truncated} more*`;
        }
      }

      if (helpText.length < maxLength - 50) {
        helpText += `\n\n💡 \`${prefix}subscribe\` for premium!`;
      }
    }

    return message.reply(helpText);
  }

  private async showPremiumHelp(
    message: Message,
    prefix: string,
  ): Promise<Message> {
    const allCommands = Array.from(this.botClient.commands.values());
    const premiumCommands = allCommands.filter(
      (cmd) => (cmd.premiumTier || "premium") === "premium",
    );
    const proCommands = allCommands.filter((cmd) => cmd.premiumTier === "pro");

    let helpText = "🌟 **Premium Features**\n\n";

    helpText += "📊 **Tiers:**\n";
    helpText +=
      "🆓 Free: 5 cmds/day, 10 effects, 5 custom commands (room owners)\n";
    helpText +=
      "⭐ Premium: 25 cmds/day, unlimited effects, 25 custom commands ($4.99)\n";
    helpText +=
      "💎 Pro: 100 cmds/day, unlimited + AI, 100 custom commands ($9.99)\n\n";

    const maxLength = 900;

    if (premiumCommands.length > 0 && helpText.length < maxLength - 200) {
      helpText += "⭐ **Premium:** ";
      const premiumNames = premiumCommands
        .slice(0, 8)
        .map((cmd) => `\`${cmd.name}\``);
      helpText += premiumNames.join(", ");
      if (premiumCommands.length > 8) {
        helpText += ` + ${premiumCommands.length - 8} more`;
      }
      helpText += "\n\n";
    }

    if (proCommands.length > 0 && helpText.length < maxLength - 150) {
      helpText += "💎 **Pro:** ";
      const proNames = proCommands.slice(0, 6).map((cmd) => `\`${cmd.name}\``);
      helpText += proNames.join(", ");
      if (proCommands.length > 6) {
        helpText += ` + ${proCommands.length - 6} more`;
      }
      helpText += "\n\n";
    }

    helpText += `🎯 **Get Started:**\n`;
    helpText += `\`${prefix}subscribe\` \`${prefix}mystatus\` \`${prefix}usage\`\n\n`;
    helpText += `🔧 **Custom Commands:**\n`;
    helpText += `\`${prefix}createcommand\` \`${prefix}listcommands\` \`${prefix}commandcooldowns\``;

    return message.reply(helpText);
  }

  private async showMainHelp(
    message: Message,
    availableTypes: string[],
    prefix: string,
  ): Promise<Message> {
    const typeCategories = this.groupTypesByCategory(availableTypes);

    let helpText = "🤖 **Mr. Whale Help**\n\n";

    // Core categories
    if (typeCategories.core.length > 0) {
      helpText += "**🎮 Core:**\n";
      helpText += typeCategories.core
        .map((type) => `\`${prefix}help ${type}\``)
        .join(" ");
      helpText += "\n\n";
    }

    // Premium categories
    if (typeCategories.premium.length > 0) {
      helpText += "**⭐ Premium:**\n";
      helpText += typeCategories.premium
        .map((type) => `\`${prefix}help ${type}\``)
        .join(" ");
      helpText += "\n\n";
    }

    // Management categories
    if (typeCategories.management.length > 0) {
      helpText += "**⚙️ Other:**\n";
      helpText += typeCategories.management
        .map((type) => `\`${prefix}help ${type}\``)
        .join(" ");
      helpText += "\n\n";
    }

    helpText += `💡 **Quick Help:**\n`;
    helpText += `\`${prefix}help premium\` \`${prefix}help [command]\` \`${prefix}subscribe\`\n`;
    helpText += `\`${prefix}listcommands\` \`${prefix}createcommand\` \`${prefix}commandcooldowns\``;

    return message.reply(helpText);
  }

  private groupTypesByCategory(types: string[]) {
    return {
      core: types.filter((t) =>
        ["fun", "game", "useful", "utility", "image"].includes(t),
      ),
      premium: types.filter((t) => ["effects", "ai"].includes(t)),
      management: types.filter((t) =>
        [
          "admin",
          "custom",
          "subscription",
          "level",
          "economy",
          "fishing",
        ].includes(t),
      ),
    };
  }

  private getTypeDisplay(type: string): string {
    const typeMap: Record<string, string> = {
      admin: "🔧 Admin",
      custom: "🛠️ Custom",
      economy: "💰 Economy",
      fishing: "🎣 Fishing",
      useful: "🔧 Useful",
      fun: "🎉 Fun",
      utility: "⚙️ Utility",
      game: "🎮 Game",
      image: "🖼️ Image",
      effects: "⭐ Effects (Premium)",
      ai: "💎 AI (Pro)",
      level: "📈 Level",
      subscription: "💳 Subscription",
    };
    return typeMap[type] || type;
  }

  private formatCommandList(
    commands: any[],
    prefix: string,
    maxLength: number,
  ): { text: string; truncated: number } {
    let text = "";
    let count = 0;

    for (const cmd of commands) {
      const line = `• \`${prefix}${cmd.name}\` - ${cmd.description.slice(
        0,
        50,
      )}\n`;

      if (text.length + line.length > maxLength) {
        break;
      }

      text += line;
      count++;
    }

    return {
      text: text.trim(),
      truncated: commands.length - count,
    };
  }
}
