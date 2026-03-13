import {
  DiscoverParams,
  GameFilterType,
  GameMaturityType,
  GameOperatingSystem,
  GamePlatformType,
  GamePriceType,
  Message,
} from "@mrwhale-io/gamejolt-client";
import { InfoBuilder } from "@mrwhale-io/core";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

const GAMES_MAX_COUNT = 5;

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "discover",
      description:
        "Discover games on Game Jolt with advanced filtering options.",
      type: "utility",
      usage: "<prefix>discover [section] [price] [os] [browser] [maturity]",
      aliases: ["browse", "find"],
      cooldown: 5000,
    });
  }

  async action(message: Message, args: string[]): Promise<Message> {
    try {
      // Parse arguments into discover parameters
      const params = this.parseArguments(args);
      const prefix = await this.botClient.getPrefix(message.room_id);

      // Fetch games using the discover API
      const games = await this.botClient.client.api.games.discover(params);

      if (!games || games.length === 0) {
        const filterInfo = this.getFilterDescription(params);
        return message.reply(
          `No games found with the specified filters${
            filterInfo ? ": " + filterInfo : ""
          }. Try different criteria!`,
        );
      }

      const formatNumber = (num: number): string => {
        return num ? num.toLocaleString() : "0";
      };

      const builder = new InfoBuilder()
        .setFormat("markdown")
        .addSection(`Game Discovery Results`, "🎮")
        .addField("Found", `${games.length} games`)
        .addDivider("line");

      // Add filter information if any filters were applied
      const filterDesc = this.getFilterDescription(params);
      if (filterDesc) {
        builder
          .addSection("🔍 Applied Filters")
          .addField("Criteria", filterDesc)
          .addDivider();
      }

      // Display top games as a list (limit to GAMES_MAX_COUNT for readability)
      const gameList = games.slice(0, GAMES_MAX_COUNT).map((game, index) => {
        const rank = index + 1;
        const rankEmoji = rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `${rank}.`;

        let gameInfo = `${rankEmoji} ${game.title}`;

        if (game.developer?.display_name) {
          gameInfo += ` by ${game.developer.display_name}`;
        }

        // Add basic stats if available
        const stats = [];
        if (game.follower_count)
          stats.push(`👥 ${formatNumber(game.follower_count)}`);
        if (game.like_count) stats.push(`❤️ ${formatNumber(game.like_count)}`);

        if (stats.length > 0) {
          gameInfo += ` • ${stats.join(" • ")}`;
        }

        // Add category and status
        const details = [];
        if (game.category) {
          details.push(
            `📂 ${
              game.category.charAt(0).toUpperCase() + game.category.slice(1)
            }`,
          );
        }

        if (game.development_status !== undefined) {
          const status = this.getGameStatus(
            game.development_status,
            game.canceled,
          );
          details.push(status);
        }

        if (details.length > 0) {
          gameInfo += ` • ${details.join(" • ")}`;
        }

        return `\`${gameInfo}\``;
      });

      builder.addList("Top Games", gameList);

      // Add pagination info and usage tips
      if (games.length >= GAMES_MAX_COUNT) {
        builder
          .addDivider("line")
          .addSection("📊 Results Info")
          .addField(
            "Showing",
            `Top ${Math.min(GAMES_MAX_COUNT, games.length)} results`,
          )
          .addField(
            "Search Specific",
            `Use ${prefix}game <name> for detailed info`,
          );
      }

      // Add usage examples
      builder
        .addDivider("line")
        .addSection("💡 Discovery Tips")
        .addList("Filter Examples", [
          `\`${prefix}discover featured, free, windows\` - Featured free Windows games`,
          `\`${prefix}discover hot, html, all\` - Hot browser games (all ages)`,
          `\`${prefix}discover new, paid\` - Newest paid games`,
          `\`${prefix}discover random\` - Random game discovery`,
        ]);

      return message.reply(builder.build());
    } catch (error) {
      this.botClient.logger?.error("Error in discover command:", error);

      const fallback = new InfoBuilder()
        .addSection("🎮 Game Discovery Error")
        .addField("Error", "Failed to discover games")
        .addField("Suggestion", "Try simpler criteria or check connection")
        .addDivider()
        .addSection("Available Filters")
        .addList("Sections", ["featured", "hot", "new", "best", "random"])
        .addList("Price", ["free", "paid", "name-your-price"])
        .addList("OS", ["windows", "mac", "linux", "other"])
        .addList("Browser", ["html", "flash", "unity"])
        .addList("Maturity", ["all", "teen", "mature"]);

      return message.reply(fallback.build());
    }
  }

  /**
   * Parse command arguments into DiscoverParams.
   * Recognizes known filter values and constructs the parameters object for the discover API.
   * @param args The array of command arguments provided by the user.
   * @returns A DiscoverParams object with the appropriate filters set based on the arguments.
   */
  private parseArguments(args: string[]): DiscoverParams {
    const params: DiscoverParams = { limit: 8 };

    // Known parameter values for validation
    const validSections: string[] = [
      "featured",
      "hot",
      "new",
      "best",
      "random",
    ];
    const validPrices: string[] = [
      "free",
      "paid",
      "name-your-price",
      "5-to-15",
      "15-and-up",
    ];
    const validOS: string[] = ["windows", "mac", "linux", "other"];
    const validBrowsers: string[] = ["html", "flash", "unity", "silverlight"];
    const validMaturity: string[] = ["all", "teen", "mature"];

    for (const arg of args) {
      const lowerArg = arg.toLowerCase() as
        | GameFilterType
        | GamePriceType
        | GameOperatingSystem
        | GamePlatformType
        | GameMaturityType;

      if (validSections.includes(lowerArg)) {
        params.section = lowerArg as GameFilterType;
      } else if (validPrices.includes(lowerArg)) {
        params.price = lowerArg as GamePriceType;
      } else if (validOS.includes(lowerArg)) {
        params.os = lowerArg as GameOperatingSystem;
      } else if (validBrowsers.includes(lowerArg)) {
        params.browser = lowerArg as GamePlatformType;
      } else if (validMaturity.includes(lowerArg)) {
        params.maturity = lowerArg as GameMaturityType;
      }
    }

    return params;
  }

  /**
   * Get human-readable description of applied filters.
   * @param params The discover parameters used for filtering games.
   * @returns A string describing the applied filters, or an empty string if no filters were applied.
   */
  private getFilterDescription(params: DiscoverParams): string {
    const filters = [];

    if (params.section) {
      filters.push(`${params.section} games`);
    }
    if (params.price) {
      filters.push(`${params.price} pricing`);
    }
    if (params.os) {
      filters.push(`${params.os} compatible`);
    }
    if (params.browser) {
      filters.push(`${params.browser} browser games`);
    }
    if (params.maturity) {
      filters.push(`${params.maturity} content rating`);
    }

    return filters.join(", ");
  }

  /**
   * Get formatted game status based on development_status and canceled flags.
   * @param developmentStatus The development status code of the game (1 = Complete, 2 = Early Access, 3 = In Development, 4 = On Hold)
   * @param canceled A boolean indicating if the game has been canceled
   * @returns A string representing the game's development status with an emoji
   */
  private getGameStatus(developmentStatus: number, canceled: boolean): string {
    if (canceled) {
      return "❌ Canceled";
    }

    switch (developmentStatus) {
      case 1:
        return "✅ Complete";
      case 2:
        return "🚧 Early Access";
      case 3:
        return "🔧 In Development";
      case 4:
        return "⏸️ On Hold";
      default:
        return "❓ Unknown Status";
    }
  }
}
