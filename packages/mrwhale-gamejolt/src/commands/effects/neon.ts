import { createCanvas, CanvasRenderingContext2D } from "canvas";

import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";
import { fetchImageFromUrl } from "../../util/fetch-image-from-url";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "neon",
      description:
        "Transform your avatar with electric neon glow and vibrant outlines! ⚡",
      type: "effects",
      usage: "<prefix>neon @user [color]",
      examples: [
        "neon",
        "neon @user",
        "neon @user purple",
        "neon @user rainbow",
      ],
      cooldown: 7000,
      premium: true,
    });
  }

  async action(message: Message, args: string[]): Promise<void> {
    const user = message.firstMentionOrAuthor;
    const colorArg =
      args.find((arg) => arg.toLowerCase() !== user.username?.toLowerCase()) ||
      "cyan";
    const neonColor = this.resolveNeonColor(colorArg.toLowerCase());

    const responseMsg = await message.reply(
      `⚡ Charging neon circuits with ${colorArg} energy...`,
    );

    try {
      const avatar = await fetchImageFromUrl(user.img_avatar);
      const canvas = createCanvas(550, 550);
      const ctx = canvas.getContext("2d");

      // Create neon effect
      this.createNeonEffect(
        ctx,
        avatar,
        canvas.width,
        canvas.height,
        neonColor,
        colorArg === "rainbow",
      );

      return uploadImage(canvas, responseMsg);
    } catch (error) {
      this.botClient.logger.error("Neon effect failed:", error);
      return responseMsg.edit(
        "❌ Power surge detected... Failed to create neon effect.",
      );
    }
  }

  private resolveNeonColor(color: string): {
    primary: string;
    secondary: string;
    accent: string;
  } {
    const neonColors: Record<
      string,
      { primary: string; secondary: string; accent: string }
    > = {
      blue: { primary: "#00BFFF", secondary: "#0080FF", accent: "#40E0D0" },
      cyan: { primary: "#00FFFF", secondary: "#00CED1", accent: "#E0FFFF" },
      pink: { primary: "#FF1493", secondary: "#FF69B4", accent: "#FFC0CB" },
      purple: { primary: "#9932CC", secondary: "#8A2BE2", accent: "#DA70D6" },
      green: { primary: "#00FF00", secondary: "#32CD32", accent: "#98FB98" },
      orange: { primary: "#FF4500", secondary: "#FF8C00", accent: "#FFB347" },
      red: { primary: "#FF0000", secondary: "#DC143C", accent: "#FF6B6B" },
      yellow: { primary: "#FFD700", secondary: "#FFFF00", accent: "#FFFFE0" },
      white: { primary: "#FFFFFF", secondary: "#F0F8FF", accent: "#F5F5F5" },
    };

    return neonColors[color] || neonColors.cyan;
  }

  private createNeonEffect(
    ctx: CanvasRenderingContext2D,
    avatar: any,
    width: number,
    height: number,
    colors: { primary: string; secondary: string; accent: string },
    rainbow: boolean,
  ): void {
    // Dark electric background
    const bgGradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      width / 2,
    );
    bgGradient.addColorStop(0, "rgb(10, 5, 20)");
    bgGradient.addColorStop(0.5, "rgb(5, 5, 15)");
    bgGradient.addColorStop(1, "rgb(0, 0, 10)");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Create multiple glow layers for depth
    this.createNeonGlowLayers(ctx, avatar, width, height, colors, rainbow);

    // Draw main avatar with slight glow
    ctx.save();
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 15;
    ctx.drawImage(avatar, 75, 75, 400, 400);
    ctx.restore();

    // Add neon outline
    this.addNeonOutline(ctx, width, height, colors, rainbow);

    // Add electric sparks
    this.addElectricSparks(ctx, width, height, colors);

    // Add pulsing energy rings
    this.addEnergyRings(ctx, width, height, colors, rainbow);

    // Add neon grid overlay
    this.addNeonGrid(ctx, width, height, colors);

    // Add electric text effects
    this.addElectricAccents(ctx, width, height, colors);
  }

  private createNeonGlowLayers(
    ctx: CanvasRenderingContext2D,
    avatar: any,
    width: number,
    height: number,
    colors: { primary: string; secondary: string; accent: string },
    rainbow: boolean,
  ): void {
    // Outer glow layers
    for (let layer = 0; layer < 4; layer++) {
      ctx.save();

      const glowSize = 50 - layer * 10;
      const alpha = 0.15 - layer * 0.03;
      const offset = layer * 3;

      ctx.globalAlpha = alpha;
      ctx.shadowColor = rainbow
        ? this.getRainbowColor(Date.now() / 1000 + layer)
        : colors.primary;
      ctx.shadowBlur = glowSize;

      ctx.drawImage(
        avatar,
        75 + offset,
        75 + offset,
        400 - offset * 2,
        400 - offset * 2,
      );

      ctx.restore();
    }
  }

  private addNeonOutline(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    colors: { primary: string; secondary: string; accent: string },
    rainbow: boolean,
  ): void {
    ctx.save();

    // Multiple outline layers for glow effect
    const outlineWidths = [8, 12, 16, 20];
    const alphas = [0.8, 0.4, 0.2, 0.1];

    for (let i = 0; i < outlineWidths.length; i++) {
      ctx.strokeStyle = rainbow
        ? this.getRainbowColor(Date.now() / 1000 + i)
        : colors.primary;
      ctx.lineWidth = outlineWidths[i];
      ctx.globalAlpha = alphas[i];
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = outlineWidths[i] * 2;

      // Avatar outline
      ctx.strokeRect(75, 75, 400, 400);

      // Border outline
      ctx.strokeRect(25, 25, width - 50, height - 50);
    }

    ctx.restore();
  }

  private addElectricSparks(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    colors: { primary: string; secondary: string; accent: string },
  ): void {
    ctx.save();

    const sparkCount = 15;
    for (let i = 0; i < sparkCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const length = Math.random() * 30 + 10;
      const angle = Math.random() * Math.PI * 2;

      ctx.beginPath();
      ctx.moveTo(x, y);

      // Create jagged lightning bolt
      for (let j = 0; j < 3; j++) {
        const segmentX =
          x +
          Math.cos(angle + (Math.random() - 0.5) * 0.5) *
            (length / 3) *
            (j + 1);
        const segmentY =
          y +
          Math.sin(angle + (Math.random() - 0.5) * 0.5) *
            (length / 3) *
            (j + 1);
        ctx.lineTo(segmentX, segmentY);
      }

      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.shadowColor = colors.primary;
      ctx.shadowBlur = 10;
      ctx.globalAlpha = 0.6 + Math.random() * 0.4;
      ctx.stroke();
    }

    ctx.restore();
  }

  private addEnergyRings(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    colors: { primary: string; secondary: string; accent: string },
    rainbow: boolean,
  ): void {
    ctx.save();

    const centerX = width / 2;
    const centerY = height / 2;

    // Pulsing energy rings
    for (let ring = 0; ring < 3; ring++) {
      const time = Date.now() / 1000;
      const radius = 150 + ring * 50 + Math.sin(time + ring) * 20;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);

      ctx.strokeStyle = rainbow
        ? this.getRainbowColor(time + ring)
        : colors.secondary;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.3 + Math.sin(time + ring) * 0.2;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 8;
      ctx.stroke();
    }

    ctx.restore();
  }

  private addNeonGrid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    colors: { primary: string; secondary: string; accent: string },
  ): void {
    ctx.save();

    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.1;
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 2;

    // Vertical lines
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  private addElectricAccents(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    colors: { primary: string; secondary: string; accent: string },
  ): void {
    ctx.save();

    // Electric corner accents
    const corners = [
      { x: 25, y: 25 },
      { x: width - 25, y: 25 },
      { x: 25, y: height - 25 },
      { x: width - 25, y: height - 25 },
    ];

    corners.forEach((corner) => {
      ctx.fillStyle = colors.primary;
      ctx.shadowColor = colors.primary;
      ctx.shadowBlur = 15;
      ctx.globalAlpha = 0.8;

      // Create electric corner accent
      ctx.beginPath();
      ctx.arc(corner.x, corner.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Add electric trails
      for (let trail = 0; trail < 3; trail++) {
        const trailX = corner.x + (Math.random() - 0.5) * 40;
        const trailY = corner.y + (Math.random() - 0.5) * 40;

        ctx.beginPath();
        ctx.moveTo(corner.x, corner.y);
        ctx.lineTo(trailX, trailY);
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  private getRainbowColor(time: number): string {
    const hue = (time * 50) % 360;
    return `hsl(${hue}, 100%, 50%)`;
  }
}
