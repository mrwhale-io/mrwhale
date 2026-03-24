import { createCanvas, CanvasRenderingContext2D } from "canvas";

import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";
import { fetchImageFromUrl } from "../../util/fetch-image-from-url";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "sparkle",
      description: "Add magical sparkle effects with twinkling particles and glittery aura! ✨",
      type: "image",
      usage: "<prefix>sparkle @user [theme]",
      examples: ["sparkle", "sparkle @user", "sparkle @user rainbow", "sparkle @user gold"],
      cooldown: 8000,
      premium: true,
    });
  }

  async action(message: Message, args: string[]): Promise<void> {
    // TODO: Add premium check once subscription system is implemented
    // if (!await this.bot.isPremiumUser(message.user.id)) {
    //   return message.reply(
    //     "🔒 **Premium Feature!** Upgrade to access magical sparkle effects!\n" +
    //     "Get premium for exclusive image commands and unlimited usage."
    //   );
    // }

    const user = message.firstMentionOrAuthor;
    const theme = args.find(arg => 
      ["rainbow", "gold", "silver", "pink", "blue", "purple"].includes(arg.toLowerCase())
    ) || "rainbow";
    
    const responseMsg = await message.reply(`✨ Sprinkling magical ${theme} sparkles...`);

    try {
      const avatar = await fetchImageFromUrl(user.img_avatar);
      const canvas = createCanvas(550, 550);
      const ctx = canvas.getContext("2d");

      // Create sparkle effect
      this.createSparkleEffect(ctx, avatar, canvas.width, canvas.height, theme);

      return uploadImage(canvas, responseMsg);
    } catch (error) {
      this.botClient.logger.error("Sparkle effect failed:", error);
      return responseMsg.edit("❌ The magic fades... Failed to create sparkle effect.");
    }
  }

  private createSparkleEffect(
    ctx: CanvasRenderingContext2D,
    avatar: any,
    width: number,
    height: number,
    theme: string
  ): void {
    // Magical gradient background
    this.drawMagicalBackground(ctx, width, height, theme);

    // Draw avatar with magical enhancement
    ctx.save();
    ctx.drawImage(avatar, 75, 75, 400, 400);
    
    // Apply magical glow effect
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(75, 75, 400, 400);
    
    ctx.globalCompositeOperation = "overlay";
    const glowColor = this.getThemeColors(theme).glow;
    ctx.fillStyle = `${glowColor}20`;
    ctx.fillRect(75, 75, 400, 400);
    ctx.restore();

    // Add magical aura
    this.addMagicalAura(ctx, width, height, theme);

    // Add floating sparkle particles
    this.addSparkleParticles(ctx, width, height, theme);

    // Add twinkling stars
    this.addTwinklingStars(ctx, width, height, theme);

    // Add glitter trail
    this.addGlitterTrail(ctx, width, height, theme);

    // Add magical symbols
    this.addMagicalSymbols(ctx, width, height, theme);
  }

  private drawMagicalBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    theme: string
  ): void {
    const colors = this.getThemeColors(theme);
    
    // Magical gradient background
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/1.5);
    gradient.addColorStop(0, colors.background.center);
    gradient.addColorStop(0.6, colors.background.middle);
    gradient.addColorStop(1, colors.background.edge);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add soft sparkle backdrop
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 3 + 1;
      
      ctx.fillStyle = colors.backdrop;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private addMagicalAura(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    theme: string
  ): void {
    ctx.save();
    
    const colors = this.getThemeColors(theme);
    const time = Date.now() / 1000;
    const pulseIntensity = 0.3 + Math.sin(time * 2) * 0.2;
    
    // Magical aura around avatar
    const auraGradient = ctx.createRadialGradient(width/2, height/2, 100, width/2, height/2, 250);
    auraGradient.addColorStop(0, `${colors.aura}${Math.floor(pulseIntensity * 255).toString(16).padStart(2, '0')}`);
    auraGradient.addColorStop(0.7, `${colors.aura}${Math.floor(pulseIntensity * 0.5 * 255).toString(16).padStart(2, '0')}`);
    auraGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = auraGradient;
    ctx.fillRect(0, 0, width, height);

    // Pulsing magical rings
    for (let ring = 0; ring < 3; ring++) {
      const ringPulse = Math.sin(time * 3 + ring) * 0.3 + 0.7;
      const radius = 120 + ring * 40;
      
      ctx.strokeStyle = `${colors.rings}${Math.floor(ringPulse * 100).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(width/2, height/2, radius * ringPulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private addSparkleParticles(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    theme: string
  ): void {
    ctx.save();
    
    const colors = this.getThemeColors(theme);
    const time = Date.now() / 1000;
    const particleCount = theme === "rainbow" ? 60 : 40;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 80 + Math.sin(time + i * 0.5) * 120;
      const x = width/2 + Math.cos(angle + time * 0.5) * distance;
      const y = height/2 + Math.sin(angle + time * 0.5) * distance;
      
      const sparkleSize = 2 + Math.sin(time * 4 + i) * 3;
      const brightness = 0.5 + Math.sin(time * 3 + i) * 0.5;
      
      // Get particle color
      const particleColor = theme === "rainbow" 
        ? this.getRainbowColor(i / particleCount)
        : colors.particles;
      
      // Draw sparkle with glow
      ctx.shadowColor = particleColor;
      ctx.shadowBlur = 15;
      ctx.fillStyle = particleColor;
      ctx.globalAlpha = brightness;
      
      this.drawSparkle(ctx, x, y, sparkleSize);
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  private addTwinklingStars(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    theme: string
  ): void {
    ctx.save();
    
    const colors = this.getThemeColors(theme);
    const time = Date.now() / 1000;

    // Large twinkling stars
    for (let i = 0; i < 12; i++) {
      const x = (Math.sin(time * 0.3 + i) + 1) * width * 0.3 + width * 0.2;
      const y = (Math.cos(time * 0.2 + i * 1.5) + 1) * height * 0.3 + height * 0.2;
      const twinkle = Math.sin(time * 6 + i) * 0.5 + 0.5;
      const size = 5 + twinkle * 8;
      
      ctx.shadowColor = colors.stars;
      ctx.shadowBlur = 20;
      ctx.fillStyle = colors.stars;
      ctx.globalAlpha = twinkle;
      
      this.drawStar(ctx, x, y, size, 4);
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  private addGlitterTrail(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    theme: string
  ): void {
    ctx.save();
    
    const colors = this.getThemeColors(theme);
    const time = Date.now() / 1000;

    // Flowing glitter trail
    for (let i = 0; i < 30; i++) {
      const progress = i / 30;
      const x = width * (0.1 + progress * 0.8) + Math.sin(time + progress * Math.PI * 2) * 50;
      const y = height * (0.2 + progress * 0.6) + Math.cos(time * 1.5 + progress * Math.PI * 3) * 30;
      
      const trailSize = (1 - progress) * 4 + 1;
      const opacity = (1 - progress) * 0.8;
      
      ctx.fillStyle = colors.trail;
      ctx.globalAlpha = opacity;
      
      this.drawSparkle(ctx, x, y, trailSize);
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  private addMagicalSymbols(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    theme: string
  ): void {
    ctx.save();
    
    const colors = this.getThemeColors(theme);
    const time = Date.now() / 1000;
    const symbols = ["✦", "✧", "✨", "⭐", "✪", "❅"];

    for (let i = 0; i < 8; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const float = Math.sin(time + i) * 10;
      const fade = 0.3 + Math.sin(time + i) * 0.3;
      const symbol = symbols[i % symbols.length];
      
      ctx.font = `${16 + Math.sin(time + i) * 4}px serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = colors.symbols;
      ctx.globalAlpha = fade;
      ctx.fillText(symbol, x, y + float);
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  private drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    // Diamond sparkle shape
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.3, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size * 0.3, y);
    ctx.closePath();
    ctx.fill();

    // Cross sparkle lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = ctx.fillStyle;
    ctx.beginPath();
    ctx.moveTo(x - size * 1.2, y);
    ctx.lineTo(x + size * 1.2, y);
    ctx.moveTo(x, y - size * 1.2);
    ctx.lineTo(x, y + size * 1.2);
    ctx.stroke();
  }

  private drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, points: number): void {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const radius = i % 2 === 0 ? size : size * 0.4;
      const starX = x + Math.cos(angle) * radius;
      const starY = y + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(starX, starY);
      } else {
        ctx.lineTo(starX, starY);
      }
    }
    ctx.closePath();
    ctx.fill();
  }

  private getThemeColors(theme: string): {
    background: { center: string; middle: string; edge: string };
    backdrop: string;
    aura: string;
    rings: string;
    particles: string;
    stars: string;
    trail: string;
    symbols: string;
    glow: string;
  } {
    switch (theme.toLowerCase()) {
      case "gold":
        return {
          background: { center: "#2A1810", middle: "#1A0F08", edge: "#0A0503" },
          backdrop: "#FFD700",
          aura: "#FFD700",
          rings: "#FFA500",
          particles: "#FFFF00",
          stars: "#FFFACD",
          trail: "#DAA520",
          symbols: "#F0E68C",
          glow: "rgba(255, 215, 0"
        };
      case "silver":
        return {
          background: { center: "#1A1A20", middle: "#0F0F15", edge: "#05050A" },
          backdrop: "#C0C0C0",
          aura: "#C0C0C0",
          rings: "#E0E0E0",
          particles: "#FFFFFF",
          stars: "#F5F5F5",
          trail: "#A0A0A0",
          symbols: "#D3D3D3",
          glow: "rgba(192, 192, 192"
        };
      case "pink":
        return {
          background: { center: "#2A0A20", middle: "#1A0510", edge: "#0A0308" },
          backdrop: "#FF69B4",
          aura: "#FF1493",
          rings: "#FFB6C1",
          particles: "#FF69B4",
          stars: "#FFC0CB",
          trail: "#FF1493",
          symbols: "#FFCCCB",
          glow: "rgba(255, 20, 147"
        };
      case "blue":
        return {
          background: { center: "#0A0A2A", middle: "#050510", edge: "#030308" },
          backdrop: "#1E90FF",
          aura: "#00BFFF",
          rings: "#87CEEB",
          particles: "#00FFFF",
          stars: "#E0F6FF",
          trail: "#4169E1",
          symbols: "#B0E0E6",
          glow: "rgba(30, 144, 255"
        };
      case "purple":
        return {
          background: { center: "#1A0A2A", middle: "#0F0515", edge: "#08030A" },
          backdrop: "#8A2BE2",
          aura: "#9370DB",
          rings: "#DDA0DD",
          particles: "#BA55D3",
          stars: "#E6E6FA",
          trail: "#8B008B",
          symbols: "#D8BFD8",
          glow: "rgba(138, 43, 226"
        };
      case "rainbow":
      default:
        return {
          background: { center: "#1A0A2A", middle: "#0D0515", edge: "#05030A" },
          backdrop: "#FFFFFF",
          aura: "#FF69B4",
          rings: "#00FFFF",
          particles: "#FFFF00",
          stars: "#FFFFFF",
          trail: "#FF0080",
          symbols: "#80FF80",
          glow: "rgba(255, 105, 180"
        };
    }
  }

  private getRainbowColor(progress: number): string {
    const hue = (progress * 360) % 360;
    return `hsl(${hue}, 100%, 70%)`;
  }
}