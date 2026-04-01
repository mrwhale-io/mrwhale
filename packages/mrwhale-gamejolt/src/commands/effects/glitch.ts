import { createCanvas, CanvasRenderingContext2D } from "canvas";

import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";
import { fetchImageFromUrl } from "../../util/fetch-image-from-url";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "glitch",
      description:
        "Corrupt your avatar with digital glitch effects and RGB distortion! 👾",
      type: "effects",
      usage: "<prefix>glitch @user [intensity]",
      examples: ["glitch", "glitch @user", "glitch @user 5"],
      cooldown: 8000,
      premium: true,
    });
  }

  async action(message: Message, args: string[]): Promise<void> {
    const user = message.firstMentionOrAuthor;
    const intensity = Math.max(1, Math.min(10, parseInt(args[0]) || 5)); // 1-10 scale
    const responseMsg = await message.reply(
      `👾 Corrupting data... Glitch intensity: ${intensity}/10`,
    );

    try {
      const avatar = await fetchImageFromUrl(user.img_avatar);
      const canvas = createCanvas(500, 500);
      const ctx = canvas.getContext("2d");

      // Create glitch effect
      this.createGlitchEffect(
        ctx,
        avatar,
        canvas.width,
        canvas.height,
        intensity,
      );

      return uploadImage(canvas, responseMsg);
    } catch (error) {
      this.botClient.logger.error("Glitch effect failed:", error);
      return responseMsg.edit(
        "❌ System corrupted... Failed to create glitch effect.",
      );
    }
  }

  private createGlitchEffect(
    ctx: CanvasRenderingContext2D,
    avatar: any,
    width: number,
    height: number,
    intensity: number,
  ): void {
    // Dark digital background
    ctx.fillStyle = `rgb(${5 + intensity}, 5, ${10 + intensity * 2})`;
    ctx.fillRect(0, 0, width, height);

    // Draw base avatar
    ctx.drawImage(avatar, 50, 50, 400, 400);

    // Apply multiple glitch layers based on intensity
    const glitchLayers = Math.ceil(intensity / 2) + 2;

    for (let layer = 0; layer < glitchLayers; layer++) {
      this.applyRGBDisplacement(ctx, avatar, width, height, intensity, layer);
      this.addDataCorruption(ctx, width, height, intensity);
    }

    // Add scan line interference
    this.addScanLineCorruption(ctx, width, height, intensity);

    // Add digital noise strips
    this.addNoiseStrips(ctx, width, height, intensity);

    // Add pixelated corruption blocks
    this.addCorruptionBlocks(ctx, width, height, intensity);

    // Add chromatic aberration
    this.addChromaticAberration(ctx, avatar, width, height, intensity);
  }

  private applyRGBDisplacement(
    ctx: CanvasRenderingContext2D,
    avatar: any,
    width: number,
    height: number,
    intensity: number,
    layer: number,
  ): void {
    ctx.save();

    const displacement = (intensity + layer) * 2;
    const alpha = 0.3 - layer * 0.05;

    // Red channel displacement
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(avatar, 50 + displacement, 50, 400, 400);

    // Blue channel displacement
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(avatar, 50 - displacement, 50, 400, 400);

    ctx.restore();
  }

  private addDataCorruption(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    intensity: number,
  ): void {
    ctx.save();

    const corruptionCount = intensity * 10;

    for (let i = 0; i < corruptionCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const w = Math.random() * (intensity * 20) + 5;
      const h = Math.random() * 5 + 1;

      // Random color corruption
      const colors = ["#ff00ff", "#00ffff", "#ffff00", "#ff0000", "#00ff00"];
      const color = colors[Math.floor(Math.random() * colors.length)];

      ctx.fillStyle = color;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(x, y, w, h);
    }

    ctx.restore();
  }

  private addScanLineCorruption(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    intensity: number,
  ): void {
    ctx.save();

    const corruptedLines = intensity * 3;

    for (let i = 0; i < corruptedLines; i++) {
      const y = Math.random() * height;
      const lineHeight = Math.random() * (intensity * 2) + 1;
      const offset = (Math.random() - 0.5) * intensity * 10;

      // Get image data from the line
      try {
        const imageData = ctx.getImageData(0, y, width, lineHeight);

        // Clear the original line
        ctx.fillStyle = "black";
        ctx.fillRect(0, y, width, lineHeight);

        // Draw the line with offset and color distortion
        ctx.putImageData(imageData, offset, y);

        // Add interference
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = intensity > 7 ? "#ff00ff" : "#00ffff";
        ctx.fillRect(0, y, width, lineHeight);
        ctx.globalAlpha = 1;
      } catch (error) {
        // Fallback if getImageData fails
        ctx.fillStyle = "#ff00ff";
        ctx.globalAlpha = 0.3;
        ctx.fillRect(0, y, width, lineHeight);
      }
    }

    ctx.restore();
  }

  private addNoiseStrips(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    intensity: number,
  ): void {
    ctx.save();

    const strips = intensity * 2;

    for (let i = 0; i < strips; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const w = Math.random() * 50 + 10;
      const h = Math.random() * 200 + 50;

      // Create noise pattern
      for (let nx = 0; nx < w; nx += 2) {
        for (let ny = 0; ny < h; ny += 2) {
          if (Math.random() > 0.5) {
            ctx.fillStyle = Math.random() > 0.5 ? "white" : "black";
            ctx.fillRect(x + nx, y + ny, 2, 2);
          }
        }
      }
    }

    ctx.restore();
  }

  private addCorruptionBlocks(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    intensity: number,
  ): void {
    ctx.save();

    const blocks = intensity * 1.5;

    for (let i = 0; i < blocks; i++) {
      const x = Math.random() * (width - 100);
      const y = Math.random() * (height - 100);
      const size = Math.random() * (intensity * 8) + 10;

      // Create pixelated corruption block
      const blockCanvas = createCanvas(size, size);
      const blockCtx = blockCanvas.getContext("2d");

      const pixelSize = Math.max(2, Math.floor(size / 8));
      for (let px = 0; px < size; px += pixelSize) {
        for (let py = 0; py < size; py += pixelSize) {
          const r = Math.floor(Math.random() * 256);
          const g = Math.floor(Math.random() * 256);
          const b = Math.floor(Math.random() * 256);
          blockCtx.fillStyle = `rgb(${r},${g},${b})`;
          blockCtx.fillRect(px, py, pixelSize, pixelSize);
        }
      }

      ctx.globalAlpha = 0.7;
      ctx.drawImage(blockCanvas, x, y);
    }

    ctx.restore();
  }

  private addChromaticAberration(
    ctx: CanvasRenderingContext2D,
    avatar: any,
    width: number,
    height: number,
    intensity: number,
  ): void {
    if (intensity < 6) return; // Only apply on higher intensity

    ctx.save();

    const aberration = intensity;

    // Create chromatic aberration effect
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.4;

    // Red channel
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(avatar, 50 - aberration, 50 - aberration, 400, 400);

    // Green channel
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = "lime";
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(avatar, 50, 50, 400, 400);

    // Blue channel
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(avatar, 50 + aberration, 50 + aberration, 400, 400);

    ctx.restore();
  }
}
