import { createCanvas, CanvasRenderingContext2D } from "canvas";

import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";
import { fetchImageFromUrl } from "../../util/fetch-image-from-url";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "superhero",
      description: "Become a legendary protector! Transform into a mighty superhero with cape, mask, and heroic powers! 🦸‍♂️",
      type: "image",
      usage: "<prefix>superhero @user [style]",
      examples: ["superhero", "superhero @user classic", "superhero @user cosmic"],
      cooldown: 8000,
      premium: true,
    });
  }

  async action(message: Message): Promise<void> {
    const args = message.content.split(" ");
    const user = message.firstMentionOrAuthor;
    const heroStyle = args.find(arg => 
      ["classic", "cosmic", "tech", "mystical", "elemental"].includes(arg.toLowerCase())
    ) || "classic";

    const responseMsg = await message.reply("🦸‍♂️ Awakening heroic powers and donning the mantle of justice...");

    try {
      const avatar = await fetchImageFromUrl(user.img_avatar);
      const canvas = createCanvas(600, 650);
      const ctx = canvas.getContext("2d");

      // Create superhero transformation
      this.createSuperheroCostume(ctx, avatar, canvas.width, canvas.height, heroStyle);

      return uploadImage(canvas, responseMsg);
    } catch (error) {
      this.botClient.logger.error("Superhero transformation failed:", error);
      return responseMsg.edit("❌ The villains escape justice... Failed to awaken the hero within.");
    }
  }

  private createSuperheroCostume(
    ctx: CanvasRenderingContext2D,
    avatar: any,
    width: number,
    height: number,
    heroStyle: string
  ): void {
    // Epic city skyline background
    this.drawCitySkylineBackground(ctx, width, height);

    // Draw superhero cape (behind avatar)
    this.drawSuperheroCape(ctx, width, height, heroStyle);

    // Draw avatar with heroic enhancement
    ctx.save();
    ctx.drawImage(avatar, 100, 100, 400, 400);
    
    // Apply heroic enhancement effect manually
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)"; // Brightness boost
    ctx.fillRect(100, 100, 400, 400);
    
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)"; // Contrast and saturation boost
    ctx.fillRect(100, 100, 400, 400);
    ctx.restore();

    // Add superhero mask
    this.drawSuperheroMask(ctx, width, height, heroStyle);

    // Add heroic emblem/symbol
    this.drawHeroEmblem(ctx, width, height, heroStyle);

    // Add power aura/energy
    this.addHeroPowerAura(ctx, width, height, heroStyle);

    // Add glowing eyes effect
    this.drawHeroicEyes(ctx, width, height, heroStyle);

    // Add flying/power effects
    this.addFlightEffects(ctx, width, height, heroStyle);

    // Add city protection elements
    this.addCityProtectionEffects(ctx, width, height);

    // Add dramatic lighting
    this.addHeroicLighting(ctx, width, height);
  }

  private drawCitySkylineBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Epic sunset sky
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, "#FF6B35"); // Orange
    skyGradient.addColorStop(0.3, "#F39C12"); // Golden orange
    skyGradient.addColorStop(0.6, "#E74C3C"); // Red
    skyGradient.addColorStop(0.8, "#8E44AD"); // Purple
    skyGradient.addColorStop(1, "#2C3E50"); // Dark blue
    
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    // City skyline silhouette
    this.drawCityBuildings(ctx, width, height);

    // Dramatic clouds
    this.drawDramaticClouds(ctx, width, height);

    // Spotlight/searchlight beams
    this.drawSearchlightBeams(ctx, width, height);
  }

  private drawSuperheroCape(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    heroStyle: string
  ): void {
    ctx.save();

    const styleColors = this.getHeroStyleColors(heroStyle);
    
    // Dramatic flowing cape
    const capeGradient = ctx.createLinearGradient(width * 0.3, height * 0.3, width * 0.7, height * 0.8);
    capeGradient.addColorStop(0, styleColors.primary);
    capeGradient.addColorStop(0.5, styleColors.secondary);
    capeGradient.addColorStop(1, styleColors.dark);

    ctx.fillStyle = capeGradient;

    // Cape flowing in the wind
    const time = Date.now() / 2000;
    const wave1 = Math.sin(time) * 15;
    const wave2 = Math.sin(time * 1.5) * 10;

    ctx.beginPath();
    ctx.moveTo(width * 0.2 + wave1, height * 0.4);
    ctx.quadraticCurveTo(width * 0.1 + wave2, height * 0.3, width * 0.05 + wave1, height * 0.5);
    ctx.quadraticCurveTo(width * 0.02, height * 0.7, width * 0.08 + wave2, height * 0.9);
    ctx.lineTo(width * 0.25, height);
    ctx.lineTo(width * 0.4, height * 0.6);
    ctx.quadraticCurveTo(width * 0.35, height * 0.5, width * 0.2 + wave1, height * 0.4);
    ctx.fill();

    // Right side cape
    ctx.beginPath();
    ctx.moveTo(width * 0.8 - wave1, height * 0.4);
    ctx.quadraticCurveTo(width * 0.9 - wave2, height * 0.3, width * 0.95 - wave1, height * 0.5);
    ctx.quadraticCurveTo(width * 0.98, height * 0.7, width * 0.92 - wave2, height * 0.9);
    ctx.lineTo(width * 0.75, height);
    ctx.lineTo(width * 0.6, height * 0.6);
    ctx.quadraticCurveTo(width * 0.65, height * 0.5, width * 0.8 - wave1, height * 0.4);
    ctx.fill();

    // Cape interior lining
    ctx.fillStyle = styleColors.accent;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(width * 0.25, height * 0.42);
    ctx.quadraticCurveTo(width * 0.35, height * 0.52, width * 0.65, height * 0.52);
    ctx.quadraticCurveTo(width * 0.75, height * 0.42, width * 0.75, height * 0.42);
    ctx.lineTo(width * 0.7, height * 0.85);
    ctx.lineTo(width * 0.3, height * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  private drawSuperheroMask(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    heroStyle: string
  ): void {
    ctx.save();

    const styleColors = this.getHeroStyleColors(heroStyle);
    
    // Superhero mask
    const maskGradient = ctx.createRadialGradient(width * 0.5, height * 0.22, 0, width * 0.5, height * 0.25, 60);
    maskGradient.addColorStop(0, styleColors.light);
    maskGradient.addColorStop(0.7, styleColors.primary);
    maskGradient.addColorStop(1, styleColors.dark);

    ctx.fillStyle = maskGradient;
    
    // Main mask shape around eyes
    ctx.beginPath();
    // Left eye area
    ctx.ellipse(width * 0.43, height * 0.21, 25, 15, -0.2, 0, Math.PI * 2);
    // Bridge
    ctx.rect(width * 0.47, height * 0.215, width * 0.06, 8);
    // Right eye area
    ctx.ellipse(width * 0.57, height * 0.21, 25, 15, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Mask outline
    ctx.strokeStyle = styleColors.dark;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eye cutouts
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.ellipse(width * 0.435, height * 0.21, 12, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(width * 0.565, height * 0.21, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    // Mask decorative elements
    if (heroStyle === "cosmic") {
      // Star patterns
      ctx.fillStyle = "#FFFFFF";
      for (let i = 0; i < 6; i++) {
        const starX = width * (0.4 + Math.random() * 0.2);
        const starY = height * (0.18 + Math.random() * 0.08);
        this.drawStar(ctx, starX, starY, 3, 2, 1);
      }
    } else if (heroStyle === "tech") {
      // Circuit patterns
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const lineX = width * (0.4 + i * 0.025);
        ctx.beginPath();
        ctx.moveTo(lineX, height * 0.2);
        ctx.lineTo(lineX, height * 0.24);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  private drawHeroEmblem(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    heroStyle: string
  ): void {
    ctx.save();

    const styleColors = this.getHeroStyleColors(heroStyle);
    
    // Chest emblem background
    const emblemGradient = ctx.createRadialGradient(width * 0.5, height * 0.45, 0, width * 0.5, height * 0.45, 40);
    emblemGradient.addColorStop(0, styleColors.light);
    emblemGradient.addColorStop(0.7, styleColors.primary);
    emblemGradient.addColorStop(1, styleColors.dark);

    ctx.fillStyle = emblemGradient;
    ctx.strokeStyle = styleColors.accent;
    ctx.lineWidth = 3;

    // Different emblems based on style
    switch (heroStyle) {
      case "classic":
        // Classic shield shape
        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.38);
        ctx.quadraticCurveTo(width * 0.55, height * 0.4, width * 0.55, height * 0.48);
        ctx.quadraticCurveTo(width * 0.55, height * 0.52, width * 0.5, height * 0.56);
        ctx.quadraticCurveTo(width * 0.45, height * 0.52, width * 0.45, height * 0.48);
        ctx.quadraticCurveTo(width * 0.45, height * 0.4, width * 0.5, height * 0.38);
        ctx.fill();
        ctx.stroke();
        
        // Letter or symbol
        ctx.fillStyle = styleColors.accent;
        ctx.font = "bold 24px serif";
        ctx.textAlign = "center";
        ctx.fillText("H", width * 0.5, height * 0.49);
        break;

      case "cosmic":
        // Cosmic symbol
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.47, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Galaxy spiral
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        for (let i = 0; i < 20; i++) {
          const angle = (i / 20) * Math.PI * 4;
          const radius = (i / 20) * 20;
          const x = width * 0.5 + Math.cos(angle) * radius;
          const y = height * 0.47 + Math.sin(angle) * radius;
          
          if (i === 0) {
            ctx.beginPath();
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        break;

      case "tech":
        // Tech hexagon
        this.drawHexagon(ctx, width * 0.5, height * 0.47, 25);
        ctx.fill();
        ctx.stroke();
        
        // Circuit center
        ctx.fillStyle = "#00FFFF";
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.47, 8, 0, Math.PI * 2);
        ctx.fill();
        break;

      case "mystical":
        // Mystical rune circle
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.47, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Mystical symbols
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const x1 = width * 0.5 + Math.cos(angle) * 15;
          const y1 = height * 0.47 + Math.sin(angle) * 15;
          const x2 = width * 0.5 + Math.cos(angle) * 25;
          const y2 = height * 0.47 + Math.sin(angle) * 25;
          
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        break;

      default:
        // Default diamond
        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.4);
        ctx.lineTo(width * 0.53, height * 0.47);
        ctx.lineTo(width * 0.5, height * 0.54);
        ctx.lineTo(width * 0.47, height * 0.47);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    ctx.restore();
  }

  private addHeroPowerAura(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    heroStyle: string
  ): void {
    ctx.save();

    const styleColors = this.getHeroStyleColors(heroStyle);
    const time = Date.now() / 1000;
    const pulseIntensity = 0.3 + Math.sin(time * 2) * 0.1;
    
    // Power aura
    const auraGradient = ctx.createRadialGradient(width/2, height/2, 50, width/2, height/2, 250);
    auraGradient.addColorStop(0, `${styleColors.primary}${Math.floor(pulseIntensity * 255).toString(16).padStart(2, '0')}`);
    auraGradient.addColorStop(0.5, `${styleColors.secondary}${Math.floor(pulseIntensity * 0.6 * 255).toString(16).padStart(2, '0')}`);
    auraGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = auraGradient;
    ctx.fillRect(0, 0, width, height);

    // Energy particles based on style
    for (let i = 0; i < 20; i++) {
      const particleX = width * 0.3 + Math.sin(time + i) * width * 0.2;
      const particleY = height * 0.3 + Math.cos(time * 1.5 + i) * height * 0.2;
      const size = 2 + Math.sin(time * 3 + i) * 3;
      const opacity = 0.4 + Math.sin(time * 2 + i) * 0.3;
      
      ctx.fillStyle = `${styleColors.accent}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
      ctx.beginPath();
      ctx.arc(particleX, particleY, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawHeroicEyes(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    heroStyle: string
  ): void {
    ctx.save();

    const styleColors = this.getHeroStyleColors(heroStyle);
    
    // Glowing heroic eyes
    ctx.shadowColor = styleColors.accent;
    ctx.shadowBlur = 15;

    ctx.fillStyle = styleColors.accent;
    ctx.beginPath();
    ctx.ellipse(width * 0.435, height * 0.21, 6, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(width * 0.565, height * 0.21, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bright center
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.ellipse(width * 0.435, height * 0.21, 2, 1, 0, 0, Math.PI * 2);
    ctx.ellipse(width * 0.565, height * 0.21, 2, 1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private addFlightEffects(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    heroStyle: string
  ): void {
    ctx.save();

    const styleColors = this.getHeroStyleColors(heroStyle);
    const time = Date.now() / 1000;

    // Flight trail/energy behind hero
    for (let i = 0; i < 15; i++) {
      const trailY = height * 0.7 + i * 8 + Math.sin(time + i) * 5;
      const trailX = width * 0.5 + Math.sin(time * 2 + i) * 20;
      const size = 8 - i * 0.4;
      const opacity = (15 - i) / 15 * 0.6;
      
      if (size > 0) {
        ctx.fillStyle = `${styleColors.accent}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(trailX, trailY, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Wind/speed lines
    ctx.strokeStyle = `${styleColors.light}80`;
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 10; i++) {
      const lineY = height * (0.3 + i * 0.05);
      const lineLength = 30 + Math.sin(time + i) * 20;
      
      ctx.beginPath();
      ctx.moveTo(width * 0.1, lineY);
      ctx.lineTo(width * 0.1 + lineLength, lineY);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(width * 0.9, lineY);
      ctx.lineTo(width * 0.9 - lineLength, lineY);
      ctx.stroke();
    }

    ctx.restore();
  }

  private addCityProtectionEffects(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();

    // Protective energy dome over city
    const time = Date.now() / 1000;
    const domeGradient = ctx.createRadialGradient(width * 0.5, height * 0.9, 0, width * 0.5, height * 0.9, width * 0.8);
    domeGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
    domeGradient.addColorStop(0.7, `rgba(0, 255, 255, ${0.1 + Math.sin(time) * 0.05})`);
    domeGradient.addColorStop(1, "rgba(0, 255, 255, 0)");

    ctx.fillStyle = domeGradient;
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.9, width * 0.6, Math.PI, 0, false);
    ctx.fill();

    // Energy grid lines on dome
    ctx.strokeStyle = "rgba(0, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI;
      const startX = width * 0.5 - Math.cos(angle) * width * 0.6;
      const startY = height * 0.9 - Math.sin(angle) * width * 0.6;
      const endX = width * 0.5 + Math.cos(angle) * width * 0.6;
      const endY = height * 0.9 - Math.sin(angle) * width * 0.6;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    ctx.restore();
  }

  private addHeroicLighting(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();

    // Dramatic rim lighting
    const lightGradient = ctx.createRadialGradient(width * 0.3, height * 0.2, 0, width * 0.3, height * 0.2, 200);
    lightGradient.addColorStop(0, "rgba(255, 255, 255, 0.3)");
    lightGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.1)");
    lightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = lightGradient;
    ctx.fillRect(0, 0, width, height);

    // Lightning/energy crackling
    const time = Date.now() / 1000;
    if (Math.sin(time * 5) > 0.8) {
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#FFFFFF";
      ctx.shadowBlur = 10;
      
      // Random lightning bolt
      const startX = width * (0.3 + Math.random() * 0.4);
      const startY = height * 0.1;
      let currentX = startX;
      let currentY = startY;
      
      ctx.beginPath();
      ctx.moveTo(currentX, currentY);
      
      for (let i = 0; i < 8; i++) {
        currentX += (Math.random() - 0.5) * 40;
        currentY += height * 0.1;
        ctx.lineTo(currentX, currentY);
      }
      
      ctx.stroke();
    }

    ctx.restore();
  }

  private getHeroStyleColors(heroStyle: string): { 
    primary: string; 
    secondary: string; 
    dark: string; 
    light: string; 
    accent: string 
  } {
    switch (heroStyle.toLowerCase()) {
      case "classic":
        return { 
          primary: "#DC143C", 
          secondary: "#FF6347", 
          dark: "#8B0000", 
          light: "#FFB6C1",
          accent: "#FFD700"
        };
      case "cosmic":
        return { 
          primary: "#4B0082", 
          secondary: "#9370DB", 
          dark: "#2F1B69", 
          light: "#DDA0DD",
          accent: "#FFFFFF"
        };
      case "tech":
        return { 
          primary: "#00CED1", 
          secondary: "#00FFFF", 
          dark: "#008B8B", 
          light: "#AFEEEE",
          accent: "#00FF00"
        };
      case "mystical":
        return { 
          primary: "#DAA520", 
          secondary: "#FFD700", 
          dark: "#B8860B", 
          light: "#F0E68C",
          accent: "#FFFFFF"
        };
      case "elemental":
        return { 
          primary: "#FF4500", 
          secondary: "#FF8C00", 
          dark: "#CC4500", 
          light: "#FFA500",
          accent: "#FFFF00"
        };
      default:
        return { 
          primary: "#0000FF", 
          secondary: "#4169E1", 
          dark: "#000080", 
          light: "#87CEEB",
          accent: "#FFFFFF"
        };
    }
  }

  private drawCityBuildings(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";

    // Skyscraper silhouettes
    const buildings = [
      { x: 0, width: width * 0.08, height: height * 0.4 },
      { x: width * 0.08, width: width * 0.06, height: height * 0.5 },
      { x: width * 0.14, width: width * 0.08, height: height * 0.3 },
      { x: width * 0.22, width: width * 0.1, height: height * 0.6 },
      { x: width * 0.32, width: width * 0.07, height: height * 0.45 },
      { x: width * 0.71, width: width * 0.09, height: height * 0.55 },
      { x: width * 0.8, width: width * 0.08, height: height * 0.35 },
      { x: width * 0.88, width: width * 0.06, height: height * 0.48 },
      { x: width * 0.94, width: width * 0.06, height: height * 0.4 },
    ];

    buildings.forEach(building => {
      const buildingTop = height - building.height;
      ctx.fillRect(building.x, buildingTop, building.width, building.height);
      
      // Windows
      ctx.fillStyle = "rgba(255, 255, 0, 0.8)";
      const windowRows = Math.floor(building.height / 25);
      const windowCols = Math.floor(building.width / 15);
      
      for (let row = 0; row < windowRows; row++) {
        for (let col = 0; col < windowCols; col++) {
          if (Math.random() > 0.3) { // 70% chance of light being on
            const windowX = building.x + col * 15 + 3;
            const windowY = buildingTop + row * 25 + 5;
            ctx.fillRect(windowX, windowY, 8, 12);
          }
        }
      }
      
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    });

    ctx.restore();
  }

  private drawDramaticClouds(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    
    const time = Date.now() / 1000;
    
    // Moving clouds
    for (let i = 0; i < 5; i++) {
      const cloudX = (time * 20 + i * 100) % (width + 100) - 50;
      const cloudY = height * (0.1 + i * 0.05);
      const cloudSize = 30 + i * 10;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 - i * 0.05})`;
      
      // Cloud shape
      ctx.beginPath();
      ctx.arc(cloudX, cloudY, cloudSize, 0, Math.PI * 2);
      ctx.arc(cloudX + cloudSize * 0.7, cloudY, cloudSize * 0.8, 0, Math.PI * 2);
      ctx.arc(cloudX - cloudSize * 0.7, cloudY, cloudSize * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawSearchlightBeams(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();

    const time = Date.now() / 1000;
    
    // Police/news helicopter searchlights
    for (let i = 0; i < 3; i++) {
      const beamAngle = Math.sin(time + i * 2) * 0.5;
      const beamX = width * (0.2 + i * 0.3);
      const beamY = height * 0.7;
      
      const beamGradient = ctx.createLinearGradient(beamX, beamY, 
        beamX + Math.sin(beamAngle) * 200, beamY - 200);
      beamGradient.addColorStop(0, "rgba(255, 255, 255, 0.6)");
      beamGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      
      ctx.fillStyle = beamGradient;
      ctx.beginPath();
      ctx.moveTo(beamX, beamY);
      ctx.lineTo(beamX + Math.sin(beamAngle - 0.3) * 180, beamY - 180);
      ctx.lineTo(beamX + Math.sin(beamAngle + 0.3) * 180, beamY - 180);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  private drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, outerRadius: number, innerRadius: number, points: number): void {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
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

  private drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const hexX = x + Math.cos(angle) * radius;
      const hexY = y + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(hexX, hexY);
      } else {
        ctx.lineTo(hexX, hexY);
      }
    }
    ctx.closePath();
  }
}