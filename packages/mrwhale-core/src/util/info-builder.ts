import { codeBlock, bold, code, link } from "./markdown-helpers";

interface Field {
  name: string;
  value: string;
}

interface InfoSection {
  type: "section";
  title: string;
  emoji?: string;
}

interface InfoDivider {
  type: "divider";
  style?: "line" | "space";
}

interface InfoField {
  type: "field";
  name: string;
  value: string;
  inline?: boolean;
}

interface InfoProgressBar {
  type: "progress";
  name: string;
  current: number;
  max: number;
  unit?: string;
  showPercentage?: boolean;
}

interface InfoList {
  type: "list";
  name: string;
  items: string[];
  ordered?: boolean;
}

interface InfoLink {
  type: "link";
  name: string;
  title: string;
  url: string;
}

interface InfoTimestamp {
  type: "timestamp";
  name: string;
  date: Date;
  format?: "relative" | "absolute" | "both";
}

type InfoElement =
  | InfoSection
  | InfoDivider
  | InfoField
  | InfoProgressBar
  | InfoList
  | InfoLink
  | InfoTimestamp;

/**
 * A fluent builder class for creating formatted information displays across multiple output formats.
 *
 * InfoBuilder provides a chainable API for constructing structured information with various element types
 * including sections, fields, progress bars, lists, links, and timestamps. It supports three output
 * formats: codeblock (wrapped in code formatting), markdown (with markdown formatting), and plain text.
 *
 * @example
 * ```typescript
 * const info = new InfoBuilder()
 *   .setFormat("markdown")
 *   .addSection("User Information", "👤")
 *   .addField("Username", "john_doe")
 *   .addProgressBar("Experience", 750, 1000, "XP")
 *   .addTimestamp("Last Seen", new Date(), "relative")
 *   .build();
 * ```
 *
 * @example
 * ```typescript
 * // Conditional content and multiple fields
 * const builder = new InfoBuilder()
 *   .addSection("Server Stats")
 *   .addFields(
 *     { name: "Online Users", value: "42" },
 *     { name: "Uptime", value: "5 days" }
 *   )
 *   .addConditional(hasPermission, (b) =>
 *     b.addField("Admin Panel", "Available")
 *   );
 * ```
 */
export class InfoBuilder {
  private elements: InfoElement[] = [];
  private outputFormat: "codeblock" | "markdown" | "plain" = "codeblock";

  /**
   * Set the output format for the builder.
   * @param format The desired output format: "codeblock", "markdown", or "plain".
   * @returns The InfoBuilder instance for chaining.
   */
  setFormat(format: "codeblock" | "markdown" | "plain"): this {
    this.outputFormat = format;
    return this;
  }

  /**
   * Add a section header with optional emoji.
   * @param title The title of the section.
   * @param emoji An optional emoji to display alongside the section title.
   * @returns The InfoBuilder instance for chaining.
   */
  addSection(title: string, emoji?: string): this {
    this.elements.push({ type: "section", title, emoji });
    return this;
  }

  /**
   * Add a divider (line or space) to separate sections of content.
   * @param style The style of the divider: "line" or "space".
   * @returns The InfoBuilder instance for chaining.
   */
  addDivider(style: "line" | "space" = "space"): this {
    this.elements.push({ type: "divider", style });
    return this;
  }

  /**
   * Add a simple field (backward compatible)
   * @param name The name of the field.
   * @param value The value of the field.
   * @param inline Whether the field should be displayed inline.
   * @returns The InfoBuilder instance for chaining.
   */
  addField(name: string, value: string, inline = false): this {
    this.elements.push({ type: "field", name, value, inline });
    return this;
  }

  /**
   * Add multiple fields at once (backward compatible)
   * @param fields The fields to add.
   * @returns The InfoBuilder instance for chaining.
   */
  addFields(...fields: Field[]): this {
    fields.forEach((field) => this.addField(field.name, field.value));
    return this;
  }

  /**
   * Add a progress bar to visually represent progress towards a goal.
   * @param name The name of the progress bar.
   * @param current The current value of the progress bar.
   * @param max The maximum value of the progress bar.
   * @param unit An optional unit to display alongside the progress bar.
   * @param showPercentage Whether to display the percentage completed.
   * @returns The InfoBuilder instance for chaining.
   */
  addProgressBar(
    name: string,
    current: number,
    max: number,
    unit?: string,
    showPercentage = true,
  ): this {
    this.elements.push({
      type: "progress",
      name,
      current,
      max,
      unit,
      showPercentage,
    });
    return this;
  }

  /**
   * Add a list of items.
   * @param name The name of the list.
   * @param items The items to include in the list.
   * @param ordered Whether the list should be ordered.
   * @returns The InfoBuilder instance for chaining.
   */
  addList(name: string, items: string[], ordered = false): this {
    this.elements.push({ type: "list", name, items, ordered });
    return this;
  }

  /**
   * Adds a link element to the info builder.
   *
   * @param name - The name identifier for the link
   * @param title - The display title of the link
   * @param url - The URL that the link points to
   * @returns The current instance for method chaining
   */
  addLink(name: string, title: string, url: string): this {
    this.elements.push({ type: "link", name, title, url });
    return this;
  }

  /**
   * Add a timestamp with various formatting options.
   * @param name The name of the timestamp field.
   * @param date The date to display.
   * @param format The format to display the timestamp in: "relative", "absolute", or "both".
   * @returns The InfoBuilder instance for chaining.
   */
  addTimestamp(
    name: string,
    date: Date,
    format: "relative" | "absolute" | "both" = "absolute",
  ): this {
    this.elements.push({ type: "timestamp", name, date, format });
    return this;
  }

  /**
   * Add content conditionally.
   * @param condition The condition to evaluate. If true, the builderFn will be executed to add content.
   * @param builderFn A function that takes the InfoBuilder instance and adds content to it.
   * @returns The InfoBuilder instance for chaining.
   */
  addConditional(
    condition: boolean,
    builderFn: (builder: InfoBuilder) => void,
  ): this {
    if (condition) {
      builderFn(this);
    }
    return this;
  }

  /**
   * Creates a visual progress bar string using Unicode block characters.
   *
   * @param current - The current progress value
   * @param max - The maximum value representing 100% completion
   * @param length - The length of the progress bar in characters (default: 10)
   * @returns A string representation of the progress bar enclosed in square brackets
   *
   * @example
   * ```typescript
   * createProgressBar(5, 10, 10); // Returns "[█████░░░░░]" (50% progress)
   * createProgressBar(7, 10, 5);  // Returns "[████░]" (70% progress with 5 char length)
   * ```
   */
  private createProgressBar(current: number, max: number, length = 10): string {
    const percentage = Math.max(0, Math.min(1, current / max));
    const filled = Math.round(percentage * length);
    const empty = length - filled;

    return `[${"█".repeat(filled)}${"░".repeat(empty)}]`;
  }

  /**
   * Formats a date as a human-readable relative time string.
   *
   * @param date - The date to format relative to the current time
   * @returns A string representing the time difference (e.g., "2 days ago", "1 hour ago", "30 minutes ago", "45 seconds ago")
   *
   * @example
   * ```typescript
   * const pastDate = new Date(Date.now() - 86400000); // 1 day ago
   * const result = formatRelativeTime(pastDate);
   * console.log(result); // "1 day ago"
   * ```
   */
  private formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffHours > 0)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    return `${diffSecs} second${diffSecs !== 1 ? "s" : ""} ago`;
  }

  /**
   * Renders an InfoElement into its string representation based on the element type and output format.
   *
   * @param element - The InfoElement to render, which can be one of several types:
   *   - "section": Renders a section title with optional emoji
   *   - "divider": Renders a divider line or empty string based on style
   *   - "field": Renders a name-value pair with optional code formatting
   *   - "progress": Renders a progress bar with current/max values and optional percentage
   *   - "list": Renders an ordered or unordered list of items
   *   - "link": Renders a link with title and URL
   *   - "timestamp": Renders a formatted timestamp (absolute, relative, or both)
   *
   * @returns The formatted string representation of the element, or empty string for unknown types
   *
   * @remarks
   * The output format depends on the `outputFormat` property:
   * - "markdown": Uses markdown formatting (bold, code blocks, links)
   * - Other formats: Uses plain text with custom formatting
   */
  private renderElement(element: InfoElement): string {
    switch (element.type) {
      case "section": {
        const sectionTitle = element.emoji
          ? `${element.emoji} ${element.title}`
          : element.title;
        return this.outputFormat === "markdown"
          ? bold(sectionTitle)
          : `=== ${sectionTitle} ===`;
      }

      case "divider": {
        return element.style === "line" ? "─".repeat(20) : "";
      }

      case "field": {
        const fieldValue =
          this.outputFormat === "markdown"
            ? code(element.value)
            : element.value;
        return `${element.name}: ${fieldValue}`;
      }

      case "progress": {
        const percentage = Math.round((element.current / element.max) * 100);
        const progressBar = this.createProgressBar(
          element.current,
          element.max,
        );
        const unit = element.unit ? ` ${element.unit}` : "";
        const percentageText = element.showPercentage
          ? ` (${percentage}%)`
          : "";
        return `${element.name}: ${progressBar} ${element.current.toFixed(
          2,
        )}/${element.max.toFixed(2)}${unit}${percentageText}`;
      }

      case "list": {
        const listItems = element.items
          .map((item, index) =>
            element.ordered ? `${index + 1}. ${item}` : `• ${item}`,
          )
          .join("\n  ");
        return `${element.name}:\n  ${listItems}`;
      }

      case "link": {
        const linkText =
          this.outputFormat === "markdown"
            ? link(element.title, element.url)
            : `${element.title} (${element.url})`;
        return `${element.name}: ${linkText}`;
      }

      case "timestamp": {
        let timeValue: string;
        switch (element.format) {
          case "relative":
            timeValue = this.formatRelativeTime(element.date);
            break;
          case "both":
            timeValue = `${element.date.toLocaleString()} (${this.formatRelativeTime(
              element.date,
            )})`;
            break;
          default:
            timeValue = element.date.toLocaleString();
        }
        return `${element.name}: ${timeValue}`;
      }

      default:
        return "";
    }
  }

  /**
   * Builds and returns the formatted output string based on the configured output format.
   *
   * @returns The formatted string output. Returns a code block format by default,
   * markdown format, plain text format, or code block format based on the outputFormat setting.
   */
  build(): string {
    const output = this.elements
      .map((element) => this.renderElement(element))
      .filter((line) => line.length > 0)
      .join("\n");

    switch (this.outputFormat) {
      case "codeblock":
        return codeBlock(output);
      case "markdown":
        return output;
      case "plain":
        return output;
      default:
        return codeBlock(output);
    }
  }

  /**
   * Returns the string representation of the InfoBuilder, which is the result of the build() method.
   * @returns The formatted string output.
   */
  toString(): string {
    return this.build();
  }
}
