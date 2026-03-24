import { createCanvas, CanvasRenderingContext2D } from "canvas";

import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";
import { fetchImageFromUrl } from "../../util/fetch-image-from-url";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "dragon",
      description:
        "Roar with ancient power! Transform into a mighty dragon with scales, wings, and blazing fire! 🐉",
      type: "image",
      usage: "<prefix>dragon @user [color]",
      examples: ["dragon", "dragon @user red", "dragon @user blue"],
      cooldown: 10000,
      premium: true,
    });
  }

  async action(message: Message): Promise<void> {
    // TODO: Add premium check once subscription system is implemented
    // if (!await this.bot.isPremiumUser(message.user.id)) {
    //   return message.reply(
    //     "🔒 **Premium Costume!** Ascend to legendary status!\n" +
    //     "Get premium for exclusive dragon transformations and unlimited usage."
    //   );
    // }

    const args = message.content.split(" ");
    const user = message.firstMentionOrAuthor;
    const dragonColor =
      args.find((arg) =>
        ["red", "blue", "green", "gold", "black", "silver"].includes(
          arg.toLowerCase(),
        ),
      ) || "red";

    const responseMsg = await message.reply(
      "🐉 Awakening ancient draconic power and summoning legendary might...",
    );

    try {
      const avatar = await fetchImageFromUrl(user.img_avatar);
      const canvas = createCanvas(650, 700);
      const ctx = canvas.getContext("2d");

      // Create dragon transformation
      this.createDragonCostume(
        ctx,
        avatar,
        canvas.width,
        canvas.height,
        dragonColor,
      );

      return uploadImage(canvas, responseMsg);
    } catch (error) {
      this.botClient.logger.error("Dragon transformation failed:", error);
      return responseMsg.edit(
        "❌ The ancient magic fades... Failed to awaken the dragon.",
      );
    }
  }

  private createDragonCostume(
    ctx: CanvasRenderingContext2D,
    avatar: any,
    width: number,
    height: number,
    dragonColor: string,
  ): void {
    // Epic mountain/volcano background
    this.drawMountainVolcanoBackground(ctx, width, height);

    // Draw dragon wings (behind avatar)
    this.drawDragonWings(ctx, width, height, dragonColor);

    // Draw avatar with draconic enhancement
    ctx.save();
    ctx.drawImage(avatar, 125, 125, 400, 400);

    // Apply draconic enhancement effect manually
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)"; // Brightness boost
    ctx.fillRect(125, 125, 400, 400);

    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = "rgba(255, 200, 150, 0.2)"; // Warm hue shift and saturation
    ctx.fillRect(125, 125, 400, 400);

    ctx.globalCompositeOperation = "hard-light";
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)"; // Additional contrast
    ctx.fillRect(125, 125, 400, 400);
    ctx.restore();

    // Add dragon scales overlay
    this.addDragonScales(ctx, width, height, dragonColor);

    // Add dragon horn/spikes
    this.drawDragonHorns(ctx, width, height, dragonColor);

    // Add glowing dragon eyes
    this.drawDragonEyes(ctx, width, height, dragonColor);

    // Add fire breath effect
    this.addFireBreathEffect(ctx, width, height);

    // Add dragon claws
    this.addDragonClaws(ctx, width, height, dragonColor);

    // Add magical fire aura
    this.addFireAura(ctx, width, height);

    // Add floating embers
    this.addFloatingEmbers(ctx, width, height);

    // Add treasure elements
    this.addTreasureEffects(ctx, width, height);
  }

  private drawMountainVolcanoBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    // Epic sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, "#FF6B35"); // Orange sky
    skyGradient.addColorStop(0.3, "#F7931E"); // Golden
    skyGradient.addColorStop(0.6, "#FFD700"); // Golden yellow
    skyGradient.addColorStop(1, "#FF4500"); // Orange red

    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    // Mountain silhouettes
    this.drawMountainSilhouettes(ctx, width, height);

    // Active volcano with lava
    this.drawActiveVolcano(ctx, width, height);

    // Smoke and clouds
    this.drawVolcanicSmoke(ctx, width, height);
  }

  private drawDragonWings(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dragonColor: string,
  ): void {
    ctx.save();

    const colorMap = this.getDragonColors(dragonColor);

    // Massive dragon wings spread wide
    const wingGradient = ctx.createRadialGradient(
      width * 0.5,
      height * 0.4,
      0,
      width * 0.5,
      height * 0.6,
      300,
    );
    wingGradient.addColorStop(0, colorMap.primary);
    wingGradient.addColorStop(0.6, colorMap.secondary);
    wingGradient.addColorStop(1, colorMap.dark);

    ctx.fillStyle = wingGradient;

    // Left wing
    ctx.beginPath();
    ctx.moveTo(width * 0.2, height * 0.35);
    ctx.quadraticCurveTo(
      width * 0.05,
      height * 0.15,
      width * 0.15,
      height * 0.5,
    );
    ctx.quadraticCurveTo(
      width * 0.1,
      height * 0.75,
      width * 0.25,
      height * 0.85,
    );
    ctx.quadraticCurveTo(
      width * 0.35,
      height * 0.7,
      width * 0.4,
      height * 0.55,
    );
    ctx.quadraticCurveTo(width * 0.3, height * 0.4, width * 0.2, height * 0.35);
    ctx.fill();

    // Right wing
    ctx.beginPath();
    ctx.moveTo(width * 0.8, height * 0.35);
    ctx.quadraticCurveTo(
      width * 0.95,
      height * 0.15,
      width * 0.85,
      height * 0.5,
    );
    ctx.quadraticCurveTo(
      width * 0.9,
      height * 0.75,
      width * 0.75,
      height * 0.85,
    );
    ctx.quadraticCurveTo(
      width * 0.65,
      height * 0.7,
      width * 0.6,
      height * 0.55,
    );
    ctx.quadraticCurveTo(width * 0.7, height * 0.4, width * 0.8, height * 0.35);
    ctx.fill();

    // Wing membrane details
    ctx.strokeStyle = colorMap.dark;
    ctx.lineWidth = 3;

    // Left wing veins
    this.drawWingVeins(
      ctx,
      width * 0.2,
      height * 0.4,
      width * 0.15,
      height * 0.6,
      5,
    );
    // Right wing veins
    this.drawWingVeins(
      ctx,
      width * 0.8,
      height * 0.4,
      width * 0.85,
      height * 0.6,
      5,
    );

    ctx.restore();
  }

  private addDragonScales(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dragonColor: string,
  ): void {
    ctx.save();

    const colorMap = this.getDragonColors(dragonColor);

    // Overlay dragon scales on face and visible areas
    const scaleSize = 8;
    const scaleSpacing = 12;

    ctx.globalAlpha = 0.4;

    for (let x = 130; x < 520; x += scaleSpacing) {
      for (let y = 130; y < 520; y += scaleSpacing) {
        // Only draw scales in certain areas (not covering eyes/mouth completely)
        if ((y < 200 || y > 250) && (x < 280 || x > 370)) {
          this.drawDragonScale(
            ctx,
            x + ((y % 2) * scaleSpacing) / 2,
            y,
            scaleSize,
            colorMap,
          );
        }
      }
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  private drawDragonHorns(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dragonColor: string,
  ): void {
    ctx.save();

    const colorMap = this.getDragonColors(dragonColor);

    // Dragon horns and spikes
    const hornGradient = ctx.createLinearGradient(
      0,
      height * 0.1,
      0,
      height * 0.3,
    );
    hornGradient.addColorStop(0, colorMap.light);
    hornGradient.addColorStop(0.5, colorMap.primary);
    hornGradient.addColorStop(1, colorMap.dark);

    ctx.fillStyle = hornGradient;
    ctx.strokeStyle = colorMap.dark;
    ctx.lineWidth = 2;

    // Left horn
    ctx.beginPath();
    ctx.moveTo(width * 0.4, height * 0.15);
    ctx.lineTo(width * 0.38, height * 0.05);
    ctx.lineTo(width * 0.42, height * 0.08);
    ctx.lineTo(width * 0.45, height * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right horn
    ctx.beginPath();
    ctx.moveTo(width * 0.6, height * 0.15);
    ctx.lineTo(width * 0.62, height * 0.05);
    ctx.lineTo(width * 0.58, height * 0.08);
    ctx.lineTo(width * 0.55, height * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Smaller spikes along forehead
    for (let i = 0; i < 5; i++) {
      const x = width * (0.42 + i * 0.032);
      const y = height * 0.12;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 3, y - 12);
      ctx.lineTo(x + 3, y - 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawDragonEyes(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dragonColor: string,
  ): void {
    ctx.save();

    // Intense reptilian eyes with slit pupils
    const eyeColor =
      dragonColor === "red"
        ? "#FF6600"
        : dragonColor === "blue"
        ? "#0066FF"
        : dragonColor === "green"
        ? "#00CC00"
        : dragonColor === "gold"
        ? "#FFD700"
        : dragonColor === "black"
        ? "#FF0000"
        : "#C0C0C0";

    ctx.shadowColor = eyeColor;
    ctx.shadowBlur = 20;

    // Eye background
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.ellipse(width * 0.435, height * 0.21, 12, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(width * 0.565, height * 0.21, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Reptilian slit pupils
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.ellipse(width * 0.435, height * 0.21, 2, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(width * 0.565, height * 0.21, 2, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlights
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.ellipse(width * 0.432, height * 0.205, 2, 1, 0, 0, Math.PI * 2);
    ctx.ellipse(width * 0.568, height * 0.205, 2, 1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private addFireBreathEffect(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();

    // Fire breath coming from mouth
    const fireGradient = ctx.createRadialGradient(
      width * 0.5,
      height * 0.35,
      0,
      width * 0.7,
      height * 0.4,
      100,
    );
    fireGradient.addColorStop(0, "rgba(255, 255, 255, 0.9)"); // White hot center
    fireGradient.addColorStop(0.2, "rgba(255, 255, 0, 0.8)"); // Yellow
    fireGradient.addColorStop(0.5, "rgba(255, 140, 0, 0.7)"); // Orange
    fireGradient.addColorStop(0.8, "rgba(255, 69, 0, 0.5)"); // Red
    fireGradient.addColorStop(1, "rgba(139, 0, 0, 0.2)"); // Dark red

    ctx.fillStyle = fireGradient;

    // Main fire stream
    ctx.beginPath();
    ctx.moveTo(width * 0.52, height * 0.32);
    ctx.quadraticCurveTo(width * 0.6, height * 0.3, width * 0.7, height * 0.35);
    ctx.quadraticCurveTo(
      width * 0.8,
      height * 0.4,
      width * 0.85,
      height * 0.45,
    );
    ctx.lineTo(width * 0.82, height * 0.52);
    ctx.quadraticCurveTo(
      width * 0.72,
      height * 0.47,
      width * 0.62,
      height * 0.42,
    );
    ctx.quadraticCurveTo(
      width * 0.55,
      height * 0.38,
      width * 0.52,
      height * 0.38,
    );
    ctx.closePath();
    ctx.fill();

    // Fire particles
    for (let i = 0; i < 25; i++) {
      const time = Date.now() / 1000;
      const x = width * 0.6 + Math.sin(time + i) * 80 + i * 8;
      const y =
        height * 0.35 + Math.cos(time * 1.5 + i) * 30 + Math.random() * 40;
      const size = 2 + Math.sin(time * 3 + i) * 3;
      const intensity = Math.max(0, 1 - (x - width * 0.6) / 200);

      const particleColors = ["#FFFF00", "#FF8C00", "#FF4500", "#FF0000"];
      const color =
        particleColors[Math.floor(Math.random() * particleColors.length)];

      ctx.fillStyle = color;
      ctx.globalAlpha = intensity * 0.8;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  private addDragonClaws(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dragonColor: string,
  ): void {
    ctx.save();

    const colorMap = this.getDragonColors(dragonColor);

    // Dragon claws on hands visible at bottom of frame
    const clawPositions = [
      { x: width * 0.25, y: height * 0.85 },
      { x: width * 0.75, y: height * 0.85 },
    ];

    clawPositions.forEach((pos) => {
      // Draw hand/forearm
      ctx.fillStyle = colorMap.primary;
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y - 20, 25, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw individual claws
      ctx.fillStyle = "#2F2F2F"; // Dark gray claws
      ctx.strokeStyle = "#1A1A1A";
      ctx.lineWidth = 1;

      for (let i = 0; i < 4; i++) {
        const clawX = pos.x - 15 + i * 10;
        const clawY = pos.y - 10;

        ctx.beginPath();
        ctx.moveTo(clawX, clawY);
        ctx.lineTo(clawX - 2, clawY - 15);
        ctx.lineTo(clawX + 2, clawY - 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  private addFireAura(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();

    // Pulsing fire aura around the dragon
    const time = Date.now() / 1000;
    const pulseIntensity = 0.2 + Math.sin(time * 2) * 0.1;

    const auraGradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      50,
      width / 2,
      height / 2,
      300,
    );
    auraGradient.addColorStop(0, `rgba(255, 140, 0, ${pulseIntensity})`);
    auraGradient.addColorStop(0.5, `rgba(255, 69, 0, ${pulseIntensity * 0.6})`);
    auraGradient.addColorStop(0.8, `rgba(139, 0, 0, ${pulseIntensity * 0.3})`);
    auraGradient.addColorStop(1, "rgba(69, 0, 0, 0)");

    ctx.fillStyle = auraGradient;
    ctx.fillRect(0, 0, width, height);

    // Fire wisps
    for (let i = 0; i < 15; i++) {
      const wispX = width * 0.3 + Math.sin(time + i * 0.5) * width * 0.2;
      const wispY =
        height * 0.3 + Math.cos(time * 1.2 + i * 0.7) * height * 0.3;
      const size = 3 + Math.sin(time * 3 + i) * 4;
      const opacity = 0.4 + Math.sin(time * 2 + i) * 0.3;

      ctx.fillStyle = `rgba(255, 140, 0, ${opacity})`;
      ctx.beginPath();
      ctx.arc(wispX, wispY, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private addFloatingEmbers(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();

    // Floating fire embers
    const time = Date.now() / 1000;
    for (let i = 0; i < 30; i++) {
      const x = (Math.sin(time * 0.8 + i) + 1) * width * 0.4 + width * 0.1;
      const y =
        (Math.cos(time * 0.5 + i * 1.3) + 1) * height * 0.4 + height * 0.2;
      const size = 1 + Math.sin(time * 4 + i) * 2;
      const brightness = 0.5 + Math.sin(time * 3 + i) * 0.4;

      ctx.fillStyle = `rgba(255, ${Math.floor(
        140 * brightness,
      )}, 0, ${brightness})`;
      ctx.shadowColor = "#FF8C00";
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  private addTreasureEffects(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();

    // Gold coins scattered around
    ctx.fillStyle = "#FFD700";
    ctx.strokeStyle = "#B8860B";
    ctx.lineWidth = 2;

    const coins = [
      { x: width * 0.15, y: height * 0.9 },
      { x: width * 0.85, y: height * 0.92 },
      { x: width * 0.1, y: height * 0.75 },
      { x: width * 0.9, y: height * 0.78 },
    ];

    coins.forEach((coin) => {
      const time = Date.now() / 1000;
      const rotation = Math.sin(time + coin.x) * 0.3;

      ctx.save();
      ctx.translate(coin.x, coin.y);
      ctx.rotate(rotation);

      // Coin shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.ellipse(2, 2, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Coin
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Coin details
      ctx.strokeStyle = "#B8860B";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    });

    // Gems
    const gems = [
      { x: width * 0.12, y: height * 0.82, color: "#FF0000" }, // Ruby
      { x: width * 0.88, y: height * 0.85, color: "#0066FF" }, // Sapphire
    ];

    gems.forEach((gem) => {
      ctx.fillStyle = gem.color;
      ctx.shadowColor = gem.color;
      ctx.shadowBlur = 10;

      ctx.beginPath();
      // Diamond shape
      ctx.moveTo(gem.x, gem.y - 6);
      ctx.lineTo(gem.x - 4, gem.y - 2);
      ctx.lineTo(gem.x - 3, gem.y + 4);
      ctx.lineTo(gem.x + 3, gem.y + 4);
      ctx.lineTo(gem.x + 4, gem.y - 2);
      ctx.closePath();
      ctx.fill();
    });

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  private getDragonColors(dragonColor: string): {
    primary: string;
    secondary: string;
    dark: string;
    light: string;
  } {
    switch (dragonColor.toLowerCase()) {
      case "red":
        return {
          primary: "#CC0000",
          secondary: "#FF4444",
          dark: "#800000",
          light: "#FF6666",
        };
      case "blue":
        return {
          primary: "#0066CC",
          secondary: "#4444FF",
          dark: "#003366",
          light: "#6666FF",
        };
      case "green":
        return {
          primary: "#00AA00",
          secondary: "#44CC44",
          dark: "#006600",
          light: "#66DD66",
        };
      case "gold":
        return {
          primary: "#FFD700",
          secondary: "#FFED4A",
          dark: "#B8860B",
          light: "#FFF176",
        };
      case "black":
        return {
          primary: "#404040",
          secondary: "#666666",
          dark: "#202020",
          light: "#808080",
        };
      case "silver":
        return {
          primary: "#C0C0C0",
          secondary: "#E0E0E0",
          dark: "#808080",
          light: "#F5F5F5",
        };
      default:
        return {
          primary: "#CC0000",
          secondary: "#FF4444",
          dark: "#800000",
          light: "#FF6666",
        };
    }
  }

  private drawDragonScale(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    colorMap: { primary: string; secondary: string; dark: string },
  ): void {
    const scaleGradient = ctx.createRadialGradient(
      x,
      y - size / 3,
      0,
      x,
      y,
      size,
    );
    scaleGradient.addColorStop(0, colorMap.secondary);
    scaleGradient.addColorStop(0.7, colorMap.primary);
    scaleGradient.addColorStop(1, colorMap.dark);

    ctx.fillStyle = scaleGradient;
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = colorMap.dark;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  private drawWingVeins(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    branches: number,
  ): void {
    // Main vein
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Branch veins
    for (let i = 1; i <= branches; i++) {
      const t = i / (branches + 1);
      const midX = startX + (endX - startX) * t;
      const midY = startY + (endY - startY) * t;
      const branchLength = 20 - i * 3;

      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(midX - branchLength, midY + branchLength);
      ctx.moveTo(midX, midY);
      ctx.lineTo(midX + branchLength, midY + branchLength);
      ctx.stroke();
    }
  }

  private drawMountainSilhouettes(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";

    // Mountain range silhouette
    ctx.beginPath();
    ctx.moveTo(0, height * 0.6);
    ctx.lineTo(width * 0.1, height * 0.4);
    ctx.lineTo(width * 0.2, height * 0.5);
    ctx.lineTo(width * 0.35, height * 0.3);
    ctx.lineTo(width * 0.5, height * 0.45);
    ctx.lineTo(width * 0.65, height * 0.25);
    ctx.lineTo(width * 0.8, height * 0.4);
    ctx.lineTo(width * 0.9, height * 0.35);
    ctx.lineTo(width, height * 0.55);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private drawActiveVolcano(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();

    // Volcano shape
    ctx.fillStyle = "rgba(69, 39, 19, 0.8)"; // Dark brown
    ctx.beginPath();
    ctx.moveTo(width * 0.3, height);
    ctx.lineTo(width * 0.45, height * 0.3);
    ctx.lineTo(width * 0.55, height * 0.3);
    ctx.lineTo(width * 0.7, height);
    ctx.closePath();
    ctx.fill();

    // Lava glow from crater
    const lavaGradient = ctx.createRadialGradient(
      width * 0.5,
      height * 0.3,
      0,
      width * 0.5,
      height * 0.3,
      50,
    );
    lavaGradient.addColorStop(0, "#FFFF00");
    lavaGradient.addColorStop(0.3, "#FF8C00");
    lavaGradient.addColorStop(0.7, "#FF4500");
    lavaGradient.addColorStop(1, "#8B0000");

    ctx.fillStyle = lavaGradient;
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.3, 15, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Lava flows
    ctx.fillStyle = "rgba(255, 69, 0, 0.7)";
    ctx.beginPath();
    ctx.moveTo(width * 0.48, height * 0.32);
    ctx.quadraticCurveTo(
      width * 0.46,
      height * 0.5,
      width * 0.42,
      height * 0.8,
    );
    ctx.lineTo(width * 0.44, height * 0.8);
    ctx.quadraticCurveTo(
      width * 0.48,
      height * 0.5,
      width * 0.5,
      height * 0.32,
    );
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(width * 0.52, height * 0.32);
    ctx.quadraticCurveTo(
      width * 0.54,
      height * 0.5,
      width * 0.58,
      height * 0.8,
    );
    ctx.lineTo(width * 0.56, height * 0.8);
    ctx.quadraticCurveTo(
      width * 0.52,
      height * 0.5,
      width * 0.5,
      height * 0.32,
    );
    ctx.fill();

    ctx.restore();
  }

  private drawVolcanicSmoke(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();

    // Volcanic smoke/ash clouds
    const time = Date.now() / 1000;

    for (let i = 0; i < 8; i++) {
      const x = width * 0.5 + Math.sin(time + i) * 40;
      const y = height * 0.3 - i * 15 + Math.cos(time * 0.7 + i) * 10;
      const size = 20 + i * 5;
      const opacity = 0.3 - i * 0.03;

      ctx.fillStyle = `rgba(64, 64, 64, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
