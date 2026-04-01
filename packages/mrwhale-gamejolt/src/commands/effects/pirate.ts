import { createCanvas, CanvasRenderingContext2D } from "canvas";

import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";
import { fetchImageFromUrl } from "../../util/fetch-image-from-url";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "pirate",
      description:
        "Ahoy matey! Transform into a fearsome pirate with hat, eyepatch, and trusty sword! 🏴‍☠️",
      type: "image",
      usage: "<prefix>pirate @user",
      examples: ["pirate", "pirate @user"],
      cooldown: 8000,
      premium: true,
    });
  }

  async action(message: Message): Promise<void> {
    const user = message.firstMentionOrAuthor;
    const responseMsg = await message.reply(
      "🏴‍☠️ Hoisting the colors and preparing for adventure...",
    );

    try {
      const avatar = await fetchImageFromUrl(user.img_avatar);
      const canvas = createCanvas(550, 550);
      const ctx = canvas.getContext("2d");

      // Create pirate transformation
      this.createPirateCostume(ctx, avatar, canvas.width, canvas.height);

      return uploadImage(canvas, responseMsg);
    } catch (error) {
      this.botClient.logger.error("Pirate transformation failed:", error);
      return responseMsg.edit(
        "❌ Shiver me timbers! Failed to transform into pirate.",
      );
    }
  }

  private createPirateCostume(
    ctx: CanvasRenderingContext2D,
    avatar: any,
    width: number,
    height: number,
  ): void {
    // Ocean/ship background
    this.drawOceanBackground(ctx, width, height);

    // Draw avatar with weathered effect
    ctx.save();
    ctx.drawImage(avatar, 75, 75, 400, 400);

    // Apply weathered sepia effect manually
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgba(222, 184, 135, 0.5)"; // Sepia tone
    ctx.fillRect(75, 75, 400, 400);

    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)"; // Slight contrast boost
    ctx.fillRect(75, 75, 400, 400);
    ctx.restore();

    // Draw pirate hat
    this.drawPirateHat(ctx, width, height);

    // Draw eyepatch (randomly left or right eye)
    this.drawEyepatch(ctx, width, height);

    // Draw sword
    this.drawPirateSword(ctx, width, height);

    // Add treasure and nautical elements
    this.addNauticalEffects(ctx, width, height);

    // Add pirate mustache/beard overlay
    this.drawPirateFacialHair(ctx, width, height);

    // Add skull and crossbones effects
    this.addSkullEffects(ctx, width, height);
  }

  private drawOceanBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    // Ocean gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#87CEEB"); // Sky blue
    gradient.addColorStop(0.3, "#4682B4"); // Steel blue
    gradient.addColorStop(0.6, "#191970"); // Midnight blue
    gradient.addColorStop(1, "#000080"); // Navy blue

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add wooden ship deck texture at bottom
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(0, height * 0.8, width, height * 0.2);

    // Wood grain texture
    ctx.strokeStyle = "#654321";
    ctx.lineWidth = 2;
    for (let i = 0; i < 15; i++) {
      const y = height * 0.82 + i * 8;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Add some clouds
    this.drawClouds(ctx, width, height * 0.3);

    // Add ocean waves
    this.drawWaves(ctx, width, height);
  }

  private drawPirateHat(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();

    // Main hat (tricorne style)
    ctx.fillStyle = "#2F4F4F"; // Dark slate gray
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;

    // Hat brim
    ctx.beginPath();
    ctx.ellipse(
      width * 0.5,
      height * 0.12,
      width * 0.25,
      width * 0.08,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.stroke();

    // Hat crown
    ctx.beginPath();
    ctx.ellipse(
      width * 0.5,
      height * 0.08,
      width * 0.2,
      width * 0.06,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.stroke();

    // Feather in hat
    ctx.strokeStyle = "#8B0000"; // Dark red feather
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(width * 0.6, height * 0.08);
    ctx.quadraticCurveTo(
      width * 0.65,
      height * 0.02,
      width * 0.7,
      height * 0.05,
    );
    ctx.stroke();

    // Feather details
    ctx.strokeStyle = "#FF4500";
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const offset = i * 0.01;
      ctx.beginPath();
      ctx.moveTo(width * (0.61 + offset), height * (0.075 - offset * 2));
      ctx.lineTo(width * (0.62 + offset), height * (0.08 - offset * 2));
      ctx.stroke();
    }

    // Skull and crossbones on hat
    this.drawSkullAndCrossbones(ctx, width * 0.45, height * 0.08, 12);

    ctx.restore();
  }

  private drawEyepatch(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();

    // Randomly choose left or right eye
    const isRightEye = Math.random() > 0.5;
    const eyeX = isRightEye ? width * 0.58 : width * 0.42;
    const eyeY = height * 0.22;

    // Eyepatch
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, 18, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyepatch strap
    ctx.strokeStyle = "#2F2F2F";
    ctx.lineWidth = 4;
    ctx.beginPath();

    if (isRightEye) {
      // Strap goes around left side
      ctx.moveTo(eyeX - 18, eyeY);
      ctx.quadraticCurveTo(
        width * 0.3,
        height * 0.15,
        width * 0.25,
        height * 0.25,
      );
    } else {
      // Strap goes around right side
      ctx.moveTo(eyeX + 18, eyeY);
      ctx.quadraticCurveTo(
        width * 0.7,
        height * 0.15,
        width * 0.75,
        height * 0.25,
      );
    }
    ctx.stroke();

    // Small skull decoration on eyepatch
    ctx.fillStyle = "#C0C0C0";
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY - 2, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye sockets
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(eyeX - 2, eyeY - 4, 1.5, 0, Math.PI * 2);
    ctx.arc(eyeX + 2, eyeY - 4, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawPirateSword(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();

    // Sword position (held at an angle)
    const swordX = width * 0.85;
    const swordStartY = height * 0.4;
    const swordEndY = height * 0.85;

    // Sword blade
    ctx.fillStyle = "#C0C0C0"; // Silver
    ctx.strokeStyle = "#808080";
    ctx.lineWidth = 2;

    // Main blade
    ctx.beginPath();
    ctx.moveTo(swordX - 8, swordStartY);
    ctx.lineTo(swordX + 8, swordStartY);
    ctx.lineTo(swordX + 3, swordEndY);
    ctx.lineTo(swordX - 3, swordEndY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Blade shine
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(swordX - 2, swordStartY, 4, swordEndY - swordStartY);

    // Sword hilt/guard
    ctx.fillStyle = "#B8860B"; // Dark goldenrod
    ctx.fillRect(swordX - 15, swordStartY - 8, 30, 8);

    // Sword handle
    ctx.fillStyle = "#8B4513"; // Saddle brown
    ctx.fillRect(swordX - 4, swordStartY - 25, 8, 17);

    // Handle grip texture
    ctx.strokeStyle = "#654321";
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = swordStartY - 22 + i * 3;
      ctx.beginPath();
      ctx.moveTo(swordX - 4, y);
      ctx.lineTo(swordX + 4, y);
      ctx.stroke();
    }

    // Pommel
    ctx.fillStyle = "#B8860B";
    ctx.beginPath();
    ctx.arc(swordX, swordStartY - 25, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawPirateFacialHair(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();

    // Pirate mustache
    ctx.fillStyle = "#2F1B14"; // Dark brown
    ctx.beginPath();
    ctx.moveTo(width * 0.42, height * 0.28);
    ctx.quadraticCurveTo(
      width * 0.5,
      height * 0.26,
      width * 0.58,
      height * 0.28,
    );
    ctx.quadraticCurveTo(
      width * 0.55,
      height * 0.3,
      width * 0.5,
      height * 0.31,
    );
    ctx.quadraticCurveTo(
      width * 0.45,
      height * 0.3,
      width * 0.42,
      height * 0.28,
    );
    ctx.fill();

    // Goatee
    ctx.beginPath();
    ctx.moveTo(width * 0.47, height * 0.32);
    ctx.quadraticCurveTo(
      width * 0.5,
      height * 0.38,
      width * 0.53,
      height * 0.32,
    );
    ctx.quadraticCurveTo(
      width * 0.51,
      height * 0.36,
      width * 0.5,
      height * 0.37,
    );
    ctx.quadraticCurveTo(
      width * 0.49,
      height * 0.36,
      width * 0.47,
      height * 0.32,
    );
    ctx.fill();

    ctx.restore();
  }

  private addNauticalEffects(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();

    // Floating treasure coins
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * width;
      const y = height * 0.7 + Math.random() * height * 0.25;
      const time = Date.now() / 1000;
      const bobbing = Math.sin(time + i) * 3;

      ctx.fillStyle = "#FFD700"; // Gold
      ctx.strokeStyle = "#B8860B";
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.arc(x, y + bobbing, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Dollar sign on coin
      ctx.fillStyle = "#B8860B";
      ctx.font = "8px Arial";
      ctx.textAlign = "center";
      ctx.fillText("$", x, y + bobbing + 2);
    }

    // Ship wheel in corner
    this.drawShipWheel(ctx, width * 0.1, height * 0.85, 25);

    // Anchor
    this.drawAnchor(ctx, width * 0.9, height * 0.9, 20);

    ctx.restore();
  }

  private addSkullEffects(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();

    // Small floating skull spirits
    for (let i = 0; i < 3; i++) {
      const x = width * (0.1 + i * 0.3);
      const y = height * (0.1 + Math.random() * 0.2);
      const time = Date.now() / 1000;
      const floating = Math.sin(time + i) * 5;
      const opacity = 0.3 + Math.sin(time + i) * 0.2;

      ctx.globalAlpha = opacity;
      this.drawSkullAndCrossbones(ctx, x, y + floating, 8);
    }

    ctx.restore();
  }

  private drawClouds(
    ctx: CanvasRenderingContext2D,
    width: number,
    maxHeight: number,
  ): void {
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";

    // Draw a few clouds
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * width;
      const y = Math.random() * maxHeight;
      const size = 20 + Math.random() * 30;

      // Cloud made of overlapping circles
      for (let j = 0; j < 5; j++) {
        const cloudX = x + (j - 2) * (size * 0.3);
        const cloudY = y + Math.random() * 10 - 5;
        const cloudRadius = size * (0.7 + Math.random() * 0.3);

        ctx.beginPath();
        ctx.arc(cloudX, cloudY, cloudRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  private drawWaves(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;

    const waveHeight = 20;
    const waveCount = 8;
    const time = Date.now() / 2000;

    for (let wave = 0; wave < 3; wave++) {
      const baseY = height * (0.6 + wave * 0.1);

      ctx.beginPath();
      ctx.moveTo(0, baseY);

      for (let i = 0; i <= waveCount; i++) {
        const x = (i / waveCount) * width;
        const y =
          baseY +
          Math.sin((i / waveCount) * Math.PI * 4 + time + wave) * waveHeight;
        ctx.lineTo(x, y);
      }

      ctx.stroke();
    }

    ctx.restore();
  }

  private drawSkullAndCrossbones(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
  ): void {
    ctx.save();
    ctx.fillStyle = "#F5F5DC"; // Beige
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;

    // Skull
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.6, size * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eye sockets
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(x - size * 0.25, y - size * 0.2, size * 0.15, 0, Math.PI * 2);
    ctx.arc(x + size * 0.25, y - size * 0.2, size * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Nasal cavity
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - size * 0.1, y + size * 0.2);
    ctx.lineTo(x + size * 0.1, y + size * 0.2);
    ctx.closePath();
    ctx.fill();

    // Crossbones
    ctx.strokeStyle = "#F5F5DC";
    ctx.lineWidth = size * 0.1;

    // Bone 1 (diagonal)
    ctx.beginPath();
    ctx.moveTo(x - size * 0.8, y - size * 0.3);
    ctx.lineTo(x + size * 0.8, y + size * 0.3);
    ctx.stroke();

    // Bone 2 (diagonal opposite)
    ctx.beginPath();
    ctx.moveTo(x - size * 0.8, y + size * 0.3);
    ctx.lineTo(x + size * 0.8, y - size * 0.3);
    ctx.stroke();

    ctx.restore();
  }

  private drawShipWheel(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
  ): void {
    ctx.save();
    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = 3;

    // Outer circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner circle
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
    ctx.stroke();

    // Spokes
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(
        x + Math.cos(angle) * radius * 0.3,
        y + Math.sin(angle) * radius * 0.3,
      );
      ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawAnchor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
  ): void {
    ctx.save();
    ctx.strokeStyle = "#2F2F2F";
    ctx.fillStyle = "#2F2F2F";
    ctx.lineWidth = 3;

    // Anchor shank (vertical line)
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y + size * 0.5);
    ctx.stroke();

    // Anchor arms
    ctx.beginPath();
    ctx.moveTo(x - size * 0.6, y + size * 0.3);
    ctx.lineTo(x, y + size * 0.5);
    ctx.lineTo(x + size * 0.6, y + size * 0.3);
    ctx.stroke();

    // Anchor flukes (hooks)
    ctx.beginPath();
    ctx.arc(x - size * 0.6, y + size * 0.3, size * 0.2, 0, Math.PI);
    ctx.arc(x + size * 0.6, y + size * 0.3, size * 0.2, 0, Math.PI);
    ctx.fill();

    // Anchor stock (horizontal bar at top)
    ctx.beginPath();
    ctx.moveTo(x - size * 0.4, y - size);
    ctx.lineTo(x + size * 0.4, y - size);
    ctx.stroke();

    ctx.restore();
  }
}
