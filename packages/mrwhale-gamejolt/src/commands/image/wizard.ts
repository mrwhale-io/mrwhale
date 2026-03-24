import { createCanvas, CanvasRenderingContext2D } from "canvas";

import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";
import { fetchImageFromUrl } from "../../util/fetch-image-from-url";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "wizard",
      description:
        "Transform into a powerful wizard with magical hat, robes, and mystical effects! 🧙‍♂️",
      type: "image",
      usage: "<prefix>wizard @user [color]",
      examples: [
        "wizard",
        "wizard @user",
        "wizard @user purple",
        "wizard @user blue",
      ],
      cooldown: 8000,
      premium: true,
    });
  }

  async action(message: Message, args: string[]): Promise<void> {
    // TODO: Add premium check once subscription system is implemented
    // if (!await this.bot.isPremiumUser(message.user.id)) {
    //   return message.reply(
    //     "🔒 **Premium Costume!** Upgrade to access magical transformations!\n" +
    //     "Get premium for exclusive costume commands and unlimited usage."
    //   );
    // }

    const user = message.firstMentionOrAuthor;
    const colorArg =
      args.find((arg) => arg.toLowerCase() !== user.username?.toLowerCase()) ||
      "purple";
    const robeColor = this.resolveRobeColor(colorArg.toLowerCase());

    const responseMsg = await message.reply(
      `🧙‍♂️ Casting transformation spell with ${colorArg} magic...`,
    );

    try {
      const avatar = await fetchImageFromUrl(user.img_avatar);
      const canvas = createCanvas(550, 600);
      const ctx = canvas.getContext("2d");

      // Create wizard transformation
      this.createWizardCostume(
        ctx,
        avatar,
        canvas.width,
        canvas.height,
        robeColor,
      );

      return uploadImage(canvas, responseMsg);
    } catch (error) {
      this.botClient.logger.error("Wizard transformation failed:", error);
      return responseMsg.edit(
        "❌ Magic spell backfired... Failed to transform into wizard.",
      );
    }
  }

  private resolveRobeColor(color: string): {
    primary: string;
    secondary: string;
    accent: string;
  } {
    const robeColors: Record<
      string,
      { primary: string; secondary: string; accent: string }
    > = {
      purple: { primary: "#4B0082", secondary: "#8A2BE2", accent: "#DDA0DD" },
      blue: { primary: "#191970", secondary: "#4169E1", accent: "#87CEEB" },
      red: { primary: "#8B0000", secondary: "#DC143C", accent: "#FFB6C1" },
      green: { primary: "#006400", secondary: "#228B22", accent: "#90EE90" },
      black: { primary: "#2F2F2F", secondary: "#696969", accent: "#D3D3D3" },
      gold: { primary: "#B8860B", secondary: "#FFD700", accent: "#FFFACD" },
    };

    return robeColors[color] || robeColors.purple;
  }

  private createWizardCostume(
    ctx: CanvasRenderingContext2D,
    avatar: any,
    width: number,
    height: number,
    colors: { primary: string; secondary: string; accent: string },
  ): void {
    // Mystical background with stars
    this.drawMysticalBackground(ctx, width, height);

    // Draw wizard robes (behind avatar)
    this.drawWizardRobes(ctx, width, height, colors);

    // Draw avatar with slight magical glow
    ctx.save();
    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = 20;
    ctx.drawImage(avatar, 75, 75, 400, 400);
    ctx.restore();

    // Draw wizard hat
    this.drawWizardHat(ctx, width, height, colors);

    // Add magical beard overlay
    this.drawWizardBeard(ctx, width, height);

    // Add magical staff
    this.drawMagicalStaff(ctx, width, height, colors);

    // Add floating magical elements
    this.addMagicalEffects(ctx, width, height, colors);

    // Add magical aura
    this.addMagicalAura(ctx, width, height);
  }

  private drawMysticalBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    // Deep mystical gradient
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      width,
    );
    gradient.addColorStop(0, "rgb(15, 5, 25)");
    gradient.addColorStop(0.6, "rgb(10, 5, 20)");
    gradient.addColorStop(1, "rgb(5, 5, 15)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add twinkling stars
    ctx.save();
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2 + 1;
      const opacity = 0.3 + Math.random() * 0.7;

      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      // Add twinkle effect
      if (Math.random() > 0.7) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - size * 2, y);
        ctx.lineTo(x + size * 2, y);
        ctx.moveTo(x, y - size * 2);
        ctx.lineTo(x, y + size * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  private drawWizardRobes(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    colors: { primary: string; secondary: string; accent: string },
  ): void {
    ctx.save();

    // Main robe body
    const robeGradient = ctx.createLinearGradient(0, height * 0.4, 0, height);
    robeGradient.addColorStop(0, colors.primary);
    robeGradient.addColorStop(0.5, colors.secondary);
    robeGradient.addColorStop(1, colors.primary);

    ctx.fillStyle = robeGradient;
    ctx.beginPath();
    // Draw flowing robe shape
    ctx.moveTo(width * 0.15, height * 0.65);
    ctx.quadraticCurveTo(
      width * 0.5,
      height * 0.55,
      width * 0.85,
      height * 0.65,
    );
    ctx.lineTo(width * 0.9, height);
    ctx.lineTo(width * 0.1, height);
    ctx.closePath();
    ctx.fill();

    // Add robe sleeves
    ctx.beginPath();
    // Left sleeve
    ctx.moveTo(width * 0.05, height * 0.5);
    ctx.quadraticCurveTo(
      width * 0.2,
      height * 0.45,
      width * 0.25,
      height * 0.6,
    );
    ctx.quadraticCurveTo(
      width * 0.15,
      height * 0.7,
      width * 0.05,
      height * 0.65,
    );
    ctx.closePath();
    ctx.fill();

    // Right sleeve
    ctx.beginPath();
    ctx.moveTo(width * 0.95, height * 0.5);
    ctx.quadraticCurveTo(
      width * 0.8,
      height * 0.45,
      width * 0.75,
      height * 0.6,
    );
    ctx.quadraticCurveTo(
      width * 0.85,
      height * 0.7,
      width * 0.95,
      height * 0.65,
    );
    ctx.closePath();
    ctx.fill();

    // Add mystical symbols on robes
    this.addMysticalSymbols(ctx, width, height, colors.accent);

    ctx.restore();
  }

  private drawWizardHat(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    colors: { primary: string; secondary: string; accent: string },
  ): void {
    ctx.save();

    // Hat cone
    const hatGradient = ctx.createLinearGradient(0, 0, 0, height * 0.4);
    hatGradient.addColorStop(0, colors.primary);
    hatGradient.addColorStop(0.7, colors.secondary);
    hatGradient.addColorStop(1, colors.primary);

    ctx.fillStyle = hatGradient;
    ctx.beginPath();
    ctx.moveTo(width * 0.4, height * 0.15); // Hat brim left
    ctx.lineTo(width * 0.6, height * 0.15); // Hat brim right
    ctx.lineTo(width * 0.52, height * 0.02); // Hat tip
    ctx.closePath();
    ctx.fill();

    // Hat brim
    ctx.fillStyle = colors.secondary;
    ctx.fillRect(width * 0.35, height * 0.15, width * 0.3, height * 0.03);

    // Add stars and moons on hat
    ctx.fillStyle = colors.accent;
    // Star on hat
    this.drawStar(ctx, width * 0.46, height * 0.08, 5, 8, 4);
    this.drawStar(ctx, width * 0.54, height * 0.11, 5, 6, 3);

    // Crescent moon
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.05, 6, 0.2 * Math.PI, 1.8 * Math.PI);
    ctx.arc(
      width * 0.502,
      height * 0.05,
      4,
      0.2 * Math.PI,
      1.8 * Math.PI,
      true,
    );
    ctx.fill();

    ctx.restore();
  }

  private drawWizardBeard(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();

    // Long flowing wizard beard
    const beardGradient = ctx.createRadialGradient(
      width * 0.5,
      height * 0.35,
      0,
      width * 0.5,
      height * 0.5,
      100,
    );
    beardGradient.addColorStop(0, "rgba(220, 220, 220, 0.9)");
    beardGradient.addColorStop(0.7, "rgba(180, 180, 180, 0.7)");
    beardGradient.addColorStop(1, "rgba(140, 140, 140, 0.5)");

    ctx.fillStyle = beardGradient;
    ctx.beginPath();
    ctx.moveTo(width * 0.42, height * 0.35);
    ctx.quadraticCurveTo(
      width * 0.5,
      height * 0.45,
      width * 0.58,
      height * 0.35,
    );
    ctx.quadraticCurveTo(
      width * 0.55,
      height * 0.55,
      width * 0.5,
      height * 0.6,
    );
    ctx.quadraticCurveTo(
      width * 0.45,
      height * 0.55,
      width * 0.42,
      height * 0.35,
    );
    ctx.fill();

    // Add beard texture lines
    ctx.strokeStyle = "rgba(160, 160, 160, 0.6)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const x = width * (0.44 + i * 0.03);
      ctx.beginPath();
      ctx.moveTo(x, height * 0.38);
      ctx.quadraticCurveTo(
        x + Math.random() * 10 - 5,
        height * 0.5,
        x,
        height * 0.58,
      );
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawMagicalStaff(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    colors: { primary: string; secondary: string; accent: string },
  ): void {
    ctx.save();

    // Staff shaft
    ctx.strokeStyle = "#8B4513"; // Brown wood
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(width * 0.85, height * 0.3);
    ctx.lineTo(width * 0.88, height * 0.85);
    ctx.stroke();

    // Add wood texture
    ctx.strokeStyle = "#A0522D";
    ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
      const y = height * (0.35 + i * 0.05);
      ctx.beginPath();
      ctx.moveTo(width * 0.83, y);
      ctx.lineTo(width * 0.9, y);
      ctx.stroke();
    }

    // Magical crystal/orb at the top
    const orbGradient = ctx.createRadialGradient(
      width * 0.85,
      height * 0.25,
      0,
      width * 0.85,
      height * 0.25,
      15,
    );
    orbGradient.addColorStop(0, colors.accent);
    orbGradient.addColorStop(0.7, colors.secondary);
    orbGradient.addColorStop(1, colors.primary);

    ctx.fillStyle = orbGradient;
    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.25, 12, 0, Math.PI * 2);
    ctx.fill();

    // Magical glow around orb
    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = 20;
    ctx.fillStyle = `rgba(255, 255, 255, 0.3)`;
    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.25, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private addMagicalEffects(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    colors: { primary: string; secondary: string; accent: string },
  ): void {
    ctx.save();

    // Floating magical sparkles
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 3 + 2;
      const time = Date.now() / 1000;
      const opacity = 0.3 + Math.sin(time + i) * 0.3;

      ctx.fillStyle = `rgba(255, 215, 0, ${opacity})`;
      this.drawStar(ctx, x, y, 5, size, size * 0.5);
    }

    // Magical energy swirls
    for (let i = 0; i < 3; i++) {
      const centerX = width * (0.2 + Math.random() * 0.6);
      const centerY = height * (0.2 + Math.random() * 0.6);
      const radius = 20 + Math.random() * 30;

      ctx.strokeStyle = colors.accent + "40";
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let angle = 0; angle < Math.PI * 4; angle += 0.1) {
        const x = centerX + Math.cos(angle) * (radius - angle * 2);
        const y = centerY + Math.sin(angle) * (radius - angle * 2);

        if (angle === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  private addMagicalAura(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();

    // Pulsing magical aura around the entire wizard
    const time = Date.now() / 1000;
    const pulseIntensity = 0.1 + Math.sin(time) * 0.05;

    const auraGradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      100,
      width / 2,
      height / 2,
      200,
    );
    auraGradient.addColorStop(0, `rgba(148, 0, 211, ${pulseIntensity})`);
    auraGradient.addColorStop(0.7, `rgba(75, 0, 130, ${pulseIntensity * 0.5})`);
    auraGradient.addColorStop(1, "rgba(75, 0, 130, 0)");

    ctx.fillStyle = auraGradient;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  }

  private addMysticalSymbols(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    color: string,
  ): void {
    ctx.save();
    ctx.fillStyle = color + "80"; // Semi-transparent
    ctx.strokeStyle = color + "60";
    ctx.lineWidth = 2;

    // Ancient runes on the robe
    const symbols = [
      { x: width * 0.2, y: height * 0.75 },
      { x: width * 0.8, y: height * 0.75 },
      { x: width * 0.3, y: height * 0.85 },
      { x: width * 0.7, y: height * 0.85 },
    ];

    symbols.forEach((sym, index) => {
      ctx.save();
      ctx.translate(sym.x, sym.y);

      // Draw different mystical symbols
      switch (index % 3) {
        case 0: // Pentagram
          this.drawStar(ctx, 0, 0, 5, 8, 4);
          break;
        case 1: // Mystical circle
          ctx.beginPath();
          ctx.arc(0, 0, 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, 3, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 2: // Rune-like symbol
          ctx.beginPath();
          ctx.moveTo(-4, -6);
          ctx.lineTo(4, 6);
          ctx.moveTo(-4, 6);
          ctx.lineTo(4, -6);
          ctx.moveTo(0, -6);
          ctx.lineTo(0, 6);
          ctx.stroke();
          break;
      }

      ctx.restore();
    });

    ctx.restore();
  }

  private drawStar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number,
  ): void {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(x, y - outerRadius);

    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(
        x + Math.cos(rot) * outerRadius,
        y + Math.sin(rot) * outerRadius,
      );
      rot += step;
      ctx.lineTo(
        x + Math.cos(rot) * innerRadius,
        y + Math.sin(rot) * innerRadius,
      );
      rot += step;
    }

    ctx.lineTo(x, y - outerRadius);
    ctx.closePath();
    ctx.fill();
  }
}
