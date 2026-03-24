import { createCanvas, CanvasRenderingContext2D } from "canvas";

import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";
import { fetchImageFromUrl } from "../../util/fetch-image-from-url";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "hologram",
      description:
        "Transform your avatar into a futuristic hologram with scan lines and glow effects! ✨",
      type: "image",
      usage: "<prefix>hologram @user",
      cooldown: 8000,
      requiresPremium: true,
      premiumTier: "premium",
    });
  }

  async action(message: Message): Promise<void> {
    const user = message.firstMentionOrAuthor;
    const responseMsg = await message.reply(
      "🌟 Creating hologram projection...",
    );

    try {
      const avatar = await fetchImageFromUrl(user.img_avatar);
      const canvas = createCanvas(500, 500);
      const ctx = canvas.getContext("2d");

      // Create hologram effect
      this.createHologramEffect(ctx, avatar, canvas.width, canvas.height);

      return uploadImage(canvas, responseMsg);
    } catch (error) {
      this.botClient.logger.error("Hologram effect failed:", error);
      return responseMsg.edit(
        "❌ Failed to create hologram effect. Please try again.",
      );
    }
  }

  private createHologramEffect(
    ctx: CanvasRenderingContext2D,
    avatar: any,
    width: number,
    height: number,
  ): void {
    // Dark background
    ctx.fillStyle = "rgb(5, 5, 15)";
    ctx.fillRect(0, 0, width, height);

    // Create multiple hologram layers for depth
    for (let layer = 0; layer < 3; layer++) {
      ctx.save();

      // Apply transparency for layering effect
      ctx.globalAlpha = 0.4 - layer * 0.1;

      // Slight offset for each layer
      const offsetX = layer * 2;
      const offsetY = layer * 1;

      // Draw avatar with cyan tint
      ctx.globalCompositeOperation = "screen";
      this.drawAvatarWithTint(
        ctx,
        avatar,
        50 + offsetX,
        50 + offsetY,
        400,
        400,
        `hsl(180, 80%, ${60 + layer * 10}%)`,
      );

      ctx.restore();
    }

    // Add RGB separation effect
    this.addRGBSeparation(ctx, avatar, width, height);

    // Add scan lines
    this.addScanLines(ctx, width, height);

    // Add holographic glow border
    this.addHolographicBorder(ctx, width, height);

    // Add digital noise
    this.addDigitalNoise(ctx, width, height);

    // Add flickering effect with opacity variation
    const flicker = 0.8 + Math.random() * 0.2;
    ctx.globalAlpha = flicker;
  }

  private drawAvatarWithTint(
    ctx: CanvasRenderingContext2D,
    avatar: any,
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
  ): void {
    // Draw avatar
    ctx.drawImage(avatar, x, y, w, h);

    // Apply color tint
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  private addRGBSeparation(
    ctx: CanvasRenderingContext2D,
    avatar: any,
    width: number,
    height: number,
  ): void {
    // Create RGB channel separation
    ctx.save();

    // Red channel (shifted right)
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(avatar, 52, 50, 400, 400);

    // Green channel (normal)
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = "lime";
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(avatar, 50, 50, 400, 400);

    // Blue channel (shifted left)
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = "cyan";
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(avatar, 48, 50, 400, 400);

    ctx.restore();
  }

  private addScanLines(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";

    // Horizontal scan lines
    for (let y = 0; y < height; y += 4) {
      ctx.globalAlpha = 0.1 + Math.random() * 0.1;
      ctx.strokeStyle = "rgb(0, 255, 255)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  private addHolographicBorder(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();

    // Outer glow
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      100,
      width / 2,
      height / 2,
      300,
    );
    gradient.addColorStop(0, "rgba(0, 255, 255, 0.3)");
    gradient.addColorStop(0.7, "rgba(0, 150, 255, 0.1)");
    gradient.addColorStop(1, "rgba(0, 100, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Glowing border lines
    ctx.strokeStyle = "rgba(0, 255, 255, 0.8)";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(30, 30, width - 60, height - 60);

    ctx.restore();
  }

  private addDigitalNoise(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();
    ctx.globalAlpha = 0.05;

    // Random digital noise
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 3;

      ctx.fillStyle = Math.random() > 0.5 ? "cyan" : "white";
      ctx.fillRect(x, y, size, size);
    }

    ctx.restore();
  }
}
