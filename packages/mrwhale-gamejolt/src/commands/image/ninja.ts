import { createCanvas, CanvasRenderingContext2D } from "canvas";

import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";
import { fetchImageFromUrl } from "../../util/fetch-image-from-url";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "ninja",
      description: "Become a shadow warrior! Transform into a stealthy ninja with mask and throwing stars! 🥷",
      type: "image",
      usage: "<prefix>ninja @user [color]",
      examples: ["ninja", "ninja @user", "ninja @user black", "ninja @user red"],
      cooldown: 8000,
      premium: true,
    });
  }

  async action(message: Message, args: string[]): Promise<void> {
    // TODO: Add premium check once subscription system is implemented
    // if (!await this.bot.isPremiumUser(message.user.id)) {
    //   return message.reply(
    //     "🔒 **Premium Costume!** Upgrade to master the ancient arts!\n" +
    //     "Get premium for exclusive ninja transformations and unlimited usage."
    //   );
    // }

    const user = message.firstMentionOrAuthor;
    const colorArg = args.find(arg => arg.toLowerCase() !== user.username?.toLowerCase()) || "black";
    const ninjaColor = this.resolveNinjaColor(colorArg.toLowerCase());
    
    const responseMsg = await message.reply(`🥷 Vanishing into the shadows with ${colorArg} gear...`);

    try {
      const avatar = await fetchImageFromUrl(user.img_avatar);
      const canvas = createCanvas(550, 550);
      const ctx = canvas.getContext("2d");

      // Create ninja transformation
      this.createNinjaCostume(ctx, avatar, canvas.width, canvas.height, ninjaColor);

      return uploadImage(canvas, responseMsg);
    } catch (error) {
      this.botClient.logger.error("Ninja transformation failed:", error);
      return responseMsg.edit("❌ The shadows reject you... Failed to transform into ninja.");
    }
  }

  private resolveNinjaColor(color: string): { primary: string; secondary: string; accent: string } {
    const ninjaColors: Record<string, { primary: string; secondary: string; accent: string }> = {
      black: { primary: "#1C1C1C", secondary: "#2F2F2F", accent: "#4A4A4A" },
      red: { primary: "#8B0000", secondary: "#DC143C", accent: "#FF6B6B" },
      blue: { primary: "#191970", secondary: "#4169E1", accent: "#87CEEB" },
      green: { primary: "#2F4F2F", secondary: "#228B22", accent: "#90EE90" },
      purple: { primary: "#4B0082", secondary: "#8A2BE2", accent: "#DDA0DD" },
      white: { primary: "#F5F5F5", secondary: "#E0E0E0", accent: "#C0C0C0" },
    };

    return ninjaColors[color] || ninjaColors.black;
  }

  private createNinjaCostume(
    ctx: CanvasRenderingContext2D,
    avatar: any,
    width: number,
    height: number,
    colors: { primary: string; secondary: string; accent: string }
  ): void {
    // Mysterious night background
    this.drawNightBackground(ctx, width, height);

    // Draw ninja outfit/armor
    this.drawNinjaOutfit(ctx, width, height, colors);

    // Draw avatar with darker/stealthier effect
    ctx.save();
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 10;
    ctx.drawImage(avatar, 75, 75, 400, 400);
    
    // Apply stealth darkness effect manually
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgba(180, 180, 180, 0.6)"; // Darken effect
    ctx.fillRect(75, 75, 400, 400);
    
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)"; // Contrast boost
    ctx.fillRect(75, 75, 400, 400);
    ctx.restore();

    // Draw ninja mask (covers lower face)
    this.drawNinjaMask(ctx, width, height, colors);

    // Add throwing stars (shuriken)
    this.addThrowingStars(ctx, width, height);

    // Add stealth effects
    this.addStealthEffects(ctx, width, height, colors);

    // Add smoke/shadow effects
    this.addSmokeEffects(ctx, width, height);

    // Add katana sword
    this.drawKatana(ctx, width, height);
  }

  private drawNightBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Dark gradient night sky
    const gradient = ctx.createRadialGradient(width/2, height/3, 0, width/2, height/3, width);
    gradient.addColorStop(0, "#1e3c72");
    gradient.addColorStop(0.5, "#2a5298");
    gradient.addColorStop(1, "#0f0f23");
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add moon
    ctx.fillStyle = "#F5F5DC";
    ctx.shadowColor = "#FFFFFF";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.15, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Add stars
    ctx.fillStyle = "#FFFFFF";
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height * 0.4;
      const size = Math.random() * 2;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add bamboo silhouettes
    this.drawBambooSilhouettes(ctx, width, height);
  }

  private drawNinjaOutfit(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    colors: { primary: string; secondary: string; accent: string }
  ): void {
    ctx.save();

    // Ninja tunic/gi
    const outfitGradient = ctx.createLinearGradient(0, height * 0.4, 0, height);
    outfitGradient.addColorStop(0, colors.primary);
    outfitGradient.addColorStop(0.5, colors.secondary);
    outfitGradient.addColorStop(1, colors.primary);

    ctx.fillStyle = outfitGradient;

    // Main tunic body
    ctx.beginPath();
    ctx.moveTo(width * 0.2, height * 0.55);
    ctx.lineTo(width * 0.8, height * 0.55);
    ctx.lineTo(width * 0.85, height);
    ctx.lineTo(width * 0.15, height);
    ctx.closePath();
    ctx.fill();

    // Ninja sleeves
    ctx.beginPath();
    // Left sleeve
    ctx.moveTo(width * 0.1, height * 0.45);
    ctx.lineTo(width * 0.35, height * 0.5);
    ctx.lineTo(width * 0.3, height * 0.7);
    ctx.lineTo(width * 0.08, height * 0.65);
    ctx.closePath();
    ctx.fill();

    // Right sleeve
    ctx.beginPath();
    ctx.moveTo(width * 0.9, height * 0.45);
    ctx.lineTo(width * 0.65, height * 0.5);
    ctx.lineTo(width * 0.7, height * 0.7);
    ctx.lineTo(width * 0.92, height * 0.65);
    ctx.closePath();
    ctx.fill();

    // Add ninja belt/obi
    ctx.fillStyle = colors.accent;
    ctx.fillRect(width * 0.15, height * 0.6, width * 0.7, height * 0.08);

    // Belt buckle/knot
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(width * 0.47, height * 0.61, width * 0.06, height * 0.06);

    ctx.restore();
  }

  private drawNinjaMask(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    colors: { primary: string; secondary: string; accent: string }
  ): void {
    ctx.save();

    // Mask covers lower face and wraps around head
    ctx.fillStyle = colors.primary;
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 2;

    // Lower face mask
    ctx.beginPath();
    ctx.moveTo(width * 0.35, height * 0.25);
    ctx.quadraticCurveTo(width * 0.5, height * 0.35, width * 0.65, height * 0.25);
    ctx.lineTo(width * 0.65, height * 0.15);
    ctx.quadraticCurveTo(width * 0.5, height * 0.1, width * 0.35, height * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Head wrap/hood
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.15, width * 0.18, 0, Math.PI, true);
    ctx.fill();
    ctx.stroke();

    // Eye area remains visible - add subtle eye enhancement
    this.addNinjaEyes(ctx, width, height);

    // Mask ties/straps
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width * 0.35, height * 0.2);
    ctx.quadraticCurveTo(width * 0.25, height * 0.18, width * 0.2, height * 0.25);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width * 0.65, height * 0.2);
    ctx.quadraticCurveTo(width * 0.75, height * 0.18, width * 0.8, height * 0.25);
    ctx.stroke();

    ctx.restore();
  }

  private addNinjaEyes(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();

    // Enhanced glowing eyes effect
    ctx.shadowColor = "#FF0000";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#FFFFFF";

    // Left eye enhancement
    ctx.beginPath();
    ctx.ellipse(width * 0.435, height * 0.21, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Right eye enhancement  
    ctx.beginPath();
    ctx.ellipse(width * 0.565, height * 0.21, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Add subtle red glow
    ctx.shadowBlur = 5;
    ctx.fillStyle = "#FF4444";
    ctx.beginPath();
    ctx.ellipse(width * 0.435, height * 0.21, 1, 1, 0, 0, Math.PI * 2);
    ctx.ellipse(width * 0.565, height * 0.21, 1, 1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private addThrowingStars(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();

    const starPositions = [
      { x: width * 0.1, y: height * 0.3, rotation: 0 },
      { x: width * 0.9, y: height * 0.25, rotation: Math.PI / 4 },
      { x: width * 0.15, y: height * 0.7, rotation: Math.PI / 2 },
      { x: width * 0.85, y: height * 0.65, rotation: -Math.PI / 3 },
      { x: width * 0.05, y: height * 0.5, rotation: Math.PI / 6 },
    ];

    starPositions.forEach(star => {
      this.drawShuriken(ctx, star.x, star.y, 15, star.rotation);
    });

    // Add motion blur trails for some stars
    this.addShurikenTrails(ctx, width, height);

    ctx.restore();
  }

  private drawShuriken(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Metallic star
    ctx.fillStyle = "#C0C0C0";
    ctx.strokeStyle = "#808080";
    ctx.lineWidth = 1;

    // Four-pointed shuriken
    ctx.beginPath();
    const spikes = 4;
    for (let i = 0; i < spikes; i++) {
      const angle = (i / spikes) * Math.PI * 2;
      
      // Outer point
      const outerX = Math.cos(angle) * size;
      const outerY = Math.sin(angle) * size;
      
      // Inner points
      const innerAngle1 = angle - Math.PI / (spikes * 2);
      const innerAngle2 = angle + Math.PI / (spikes * 2);
      const innerX1 = Math.cos(innerAngle1) * size * 0.3;
      const innerY1 = Math.sin(innerAngle1) * size * 0.3;
      const innerX2 = Math.cos(innerAngle2) * size * 0.3;
      const innerY2 = Math.sin(innerAngle2) * size * 0.3;

      if (i === 0) {
        ctx.moveTo(outerX, outerY);
      } else {
        ctx.lineTo(outerX, outerY);
      }
      ctx.lineTo(innerX2, innerY2);
      ctx.lineTo(0, 0);
      ctx.lineTo(innerX1, innerY1);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Center hole
    ctx.fillStyle = "#404040";
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Metallic shine
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(-size * 0.3, -size * 0.3, size * 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private addShurikenTrails(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();

    // Motion trails for flying shuriken
    ctx.strokeStyle = "rgba(192, 192, 192, 0.3)";
    ctx.lineWidth = 2;

    // Trail 1 - diagonal
    ctx.beginPath();
    ctx.moveTo(width * 0.05, height * 0.1);
    ctx.lineTo(width * 0.15, height * 0.25);
    ctx.stroke();

    // Trail 2 - horizontal
    ctx.beginPath();
    ctx.moveTo(width * 0.75, height * 0.2);
    ctx.lineTo(width * 0.95, height * 0.22);
    ctx.stroke();

    // Add sparkle effects on trails
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    for (let i = 0; i < 8; i++) {
      const x = width * (0.1 + Math.random() * 0.8);
      const y = height * (0.1 + Math.random() * 0.3);
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private addStealthEffects(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    colors: { primary: string; secondary: string; accent: string }
  ): void {
    ctx.save();

    // Shadow clone effect - multiple translucent copies
    const time = Date.now() / 1000;
    for (let i = 0; i < 3; i++) {
      const offsetX = Math.sin(time + i) * 20;
      const offsetY = Math.cos(time + i * 2) * 15;
      const alpha = 0.1 - (i * 0.03);
      
      ctx.globalAlpha = alpha;
      ctx.fillStyle = colors.primary;
      
      // Ghost silhouette
      ctx.beginPath();
      ctx.ellipse(width * 0.5 + offsetX, height * 0.5 + offsetY, 80, 150, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;

    // Stealth shimmer effect
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const shimmerIntensity = 0.2 + Math.sin(time * 3 + i) * 0.15;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${shimmerIntensity})`;
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private addSmokeEffects(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();

    // Ninja smoke bomb effects
    const smokeAreas = [
      { x: width * 0.2, y: height * 0.8, radius: 40 },
      { x: width * 0.8, y: height * 0.75, radius: 30 },
      { x: width * 0.1, y: height * 0.9, radius: 25 },
    ];

    smokeAreas.forEach((smoke, index) => {
      const time = Date.now() / 1000;
      const puff = Math.sin(time + index) * 0.2 + 0.8;
      
      const gradient = ctx.createRadialGradient(
        smoke.x, smoke.y, 0,
        smoke.x, smoke.y, smoke.radius * puff
      );
      gradient.addColorStop(0, "rgba(70, 70, 70, 0.4)");
      gradient.addColorStop(0.5, "rgba(50, 50, 50, 0.2)");
      gradient.addColorStop(1, "rgba(30, 30, 30, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(smoke.x, smoke.y, smoke.radius * puff, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  private drawKatana(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();

    // Katana positioned diagonally across back
    const katanaStartX = width * 0.25;
    const katanaStartY = height * 0.2;
    const katanaEndX = width * 0.75;
    const katanaEndY = height * 0.45;

    // Katana scabbard (behind ninja)
    ctx.strokeStyle = "#2F2F2F";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(katanaStartX, katanaStartY);
    ctx.lineTo(katanaEndX, katanaEndY);
    ctx.stroke();

    // Katana handle (tsuka)
    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(katanaStartX, katanaStartY);
    ctx.lineTo(katanaStartX + (katanaEndX - katanaStartX) * 0.25, katanaStartY + (katanaEndY - katanaStartY) * 0.25);
    ctx.stroke();

    // Handle wrap (tsuka-maki)
    ctx.strokeStyle = "#654321";
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const progress = i / 5 * 0.25;
      const x = katanaStartX + (katanaEndX - katanaStartX) * progress;
      const y = katanaStartY + (katanaEndY - katanaStartY) * progress;
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Guard (tsuba)
    ctx.fillStyle = "#C0C0C0";
    ctx.strokeStyle = "#808080";
    ctx.lineWidth = 1;
    const guardX = katanaStartX + (katanaEndX - katanaStartX) * 0.25;
    const guardY = katanaStartY + (katanaEndY - katanaStartY) * 0.25;
    
    ctx.beginPath();
    ctx.arc(guardX, guardY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Partial blade visible (unsheathed portion)
    ctx.strokeStyle = "#E8E8E8";
    ctx.lineWidth = 4;
    ctx.shadowColor = "#FFFFFF";
    ctx.shadowBlur = 5;
    
    const bladeStartX = guardX;
    const bladeStartY = guardY;
    const bladeEndX = bladeStartX + (katanaEndX - katanaStartX) * 0.15;
    const bladeEndY = bladeStartY + (katanaEndY - katanaStartY) * 0.15;
    
    ctx.beginPath();
    ctx.moveTo(bladeStartX, bladeStartY);
    ctx.lineTo(bladeEndX, bladeEndY);
    ctx.stroke();

    ctx.restore();
  }

  private drawBambooSilhouettes(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";

    // Bamboo stalks as background silhouettes
    const bambooPositions = [
      { x: width * 0.05, height: height * 0.8 },
      { x: width * 0.95, height: height * 0.7 },
      { x: width * 0.02, height: height * 0.9 },
    ];

    bambooPositions.forEach(bamboo => {
      // Main stalk
      ctx.fillRect(bamboo.x, height - bamboo.height, 8, bamboo.height);
      
      // Bamboo segments
      for (let i = 0; i < 5; i++) {
        const segmentY = height - (bamboo.height * (i + 1) / 5);
        ctx.fillRect(bamboo.x - 2, segmentY, 12, 3);
      }
      
      // Bamboo leaves
      for (let i = 0; i < 3; i++) {
        const leafY = height - bamboo.height + (i * bamboo.height / 4);
        ctx.beginPath();
        ctx.ellipse(bamboo.x + 15, leafY, 20, 5, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.restore();
  }
}