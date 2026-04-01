import { createCanvas, CanvasRenderingContext2D } from "canvas";

import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";
import { fetchImageFromUrl } from "../../util/fetch-image-from-url";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "fire",
      description: "Ignite your avatar with blazing fire effects and burning embers! 🔥",
      type: "effects",
      usage: "<prefix>fire @user [color]",
      examples: ["fire", "fire @user", "fire @user blue", "fire @user green"],
      cooldown: 8000,
      premium: true,
    });
  }

  async action(message: Message, args: string[]): Promise<void> {
    const user = message.firstMentionOrAuthor;
    const fireColor = args.find(arg => 
      ["red", "blue", "green", "purple", "white", "gold"].includes(arg.toLowerCase())
    ) || "red";
    
    const responseMsg = await message.reply(`🔥 Igniting ${fireColor} flames and summoning infernal power...`);

    try {
      const avatar = await fetchImageFromUrl(user.img_avatar);
      const canvas = createCanvas(600, 650);
      const ctx = canvas.getContext("2d");

      // Create fire effect
      this.createFireEffect(ctx, avatar, canvas.width, canvas.height, fireColor);

      return uploadImage(canvas, responseMsg);
    } catch (error) {
      this.botClient.logger.error("Fire effect failed:", error);
      return responseMsg.edit("❌ The flames are extinguished... Failed to create fire effect.");
    }
  }

  private createFireEffect(
    ctx: CanvasRenderingContext2D,
    avatar: any,
    width: number,
    height: number,
    fireColor: string
  ): void {
    // Fiery background
    this.drawFireBackground(ctx, width, height, fireColor);

    // Draw avatar with fire enhancement
    ctx.save();
    ctx.drawImage(avatar, 100, 100, 400, 400);
    
    // Apply fire glow effect
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = "rgba(255, 100, 0, 0.1)";
    ctx.fillRect(100, 100, 400, 400);
    
    const colors = this.getFireColors(fireColor);
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = `${colors.glow}30`;
    ctx.fillRect(100, 100, 400, 400);
    ctx.restore();

    // Add fire aura
    this.addFireAura(ctx, width, height, fireColor);

    // Add dancing flames
    this.addDancingFlames(ctx, width, height, fireColor);

    // Add burning embers
    this.addBurningEmbers(ctx, width, height, fireColor);

    // Add fire particles
    this.addFireParticles(ctx, width, height, fireColor);

    // Add heat distortion waves
    this.addHeatWaves(ctx, width, height, fireColor);

    // Add fire rings
    this.addFireRings(ctx, width, height, fireColor);
  }

  private drawFireBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    fireColor: string
  ): void {
    const colors = this.getFireColors(fireColor);
    
    // Fire gradient background
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, colors.background.bottom);
    gradient.addColorStop(0.4, colors.background.middle);
    gradient.addColorStop(0.8, colors.background.top);
    gradient.addColorStop(1, "#000000");
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add flickering fire backdrop
    const time = Date.now() / 1000;
    for (let i = 0; i < 20; i++) {
      const x = (i / 20) * width + Math.sin(time + i) * 30;
      const y = height * 0.8 + Math.sin(time * 2 + i) * 20;
      const flicker = 0.5 + Math.sin(time * 4 + i) * 0.3;
      
      ctx.globalAlpha = flicker * 0.6;
      ctx.fillStyle = colors.backdrop;
      ctx.beginPath();
      ctx.ellipse(x, y, 20, 40 * flicker, 0, Math.PI, 0);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private addFireAura(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    fireColor: string
  ): void {
    ctx.save();
    
    const colors = this.getFireColors(fireColor);
    const time = Date.now() / 1000;
    const intensity = 0.4 + Math.sin(time * 3) * 0.2;
    
    // Fire aura around avatar
    const auraGradient = ctx.createRadialGradient(width/2, height/2, 80, width/2, height/2, 280);
    auraGradient.addColorStop(0, `${colors.aura.inner}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`);
    auraGradient.addColorStop(0.5, `${colors.aura.middle}${Math.floor(intensity * 0.6 * 255).toString(16).padStart(2, '0')}`);
    auraGradient.addColorStop(1, `${colors.aura.outer}00`);

    ctx.fillStyle = auraGradient;
    ctx.fillRect(0, 0, width, height);

    // Pulsing fire rings
    for (let ring = 0; ring < 4; ring++) {
      const ringIntensity = Math.sin(time * 4 + ring * Math.PI / 2) * 0.3 + 0.7;
      const radius = 140 + ring * 35;
      
      ctx.strokeStyle = `${colors.rings}${Math.floor(ringIntensity * 150).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(width/2, height/2, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private addDancingFlames(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    fireColor: string
  ): void {
    ctx.save();
    
    const colors = this.getFireColors(fireColor);
    const time = Date.now() / 1000;

    // Large dancing flames around the avatar
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const distance = 200 + Math.sin(time * 2 + i) * 50;
      const x = width/2 + Math.cos(angle) * distance;
      const y = height/2 + Math.sin(angle) * distance;
      
      const flameHeight = 40 + Math.sin(time * 3 + i) * 20;
      const flameWidth = 15 + Math.sin(time * 4 + i) * 8;
      const intensity = 0.6 + Math.sin(time * 5 + i) * 0.4;
      
      ctx.globalAlpha = intensity;
      this.drawFlame(ctx, x, y, flameWidth, flameHeight, colors.flames);
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  private addBurningEmbers(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    fireColor: string
  ): void {
    ctx.save();
    
    const colors = this.getFireColors(fireColor);
    const time = Date.now() / 1000;

    // Floating embers
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * width;
      const y = height - (time * 30 + i * 10) % (height + 100);
      const size = 2 + Math.random() * 4;
      const flicker = 0.5 + Math.sin(time * 6 + i) * 0.5;
      const drift = Math.sin(time + i) * 30;
      
      ctx.globalAlpha = flicker;
      ctx.shadowColor = colors.embers;
      ctx.shadowBlur = 10;
      ctx.fillStyle = colors.embers;
      
      ctx.beginPath();
      ctx.arc(x + drift, y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Ember trail
      if (Math.random() > 0.7) {
        ctx.strokeStyle = colors.embers;
        ctx.lineWidth = 1;
        ctx.globalAlpha = flicker * 0.5;
        ctx.beginPath();
        ctx.moveTo(x + drift, y);
        ctx.lineTo(x + drift - 5, y + 10);
        ctx.stroke();
      }
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  private addFireParticles(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    fireColor: string
  ): void {
    ctx.save();
    
    const colors = this.getFireColors(fireColor);
    const time = Date.now() / 1000;

    // Swirling fire particles
    for (let i = 0; i < 60; i++) {
      const spiralAngle = time + i * 0.1;
      const spiralRadius = 120 + Math.sin(time + i * 0.2) * 80;
      const x = width/2 + Math.cos(spiralAngle) * spiralRadius;
      const y = height/2 + Math.sin(spiralAngle) * spiralRadius;
      
      const particleSize = 1 + Math.sin(time * 4 + i) * 2;
      const heat = 0.3 + Math.sin(time * 3 + i) * 0.7;
      
      // Cycle through fire colors based on heat
      const particleColor = heat > 0.8 ? colors.particles.hot :
                           heat > 0.5 ? colors.particles.warm : colors.particles.cool;
      
      ctx.fillStyle = particleColor;
      ctx.globalAlpha = heat;
      ctx.shadowColor = particleColor;
      ctx.shadowBlur = 6;
      console.log(particleSize)
      ctx.beginPath();
      ctx.arc(x, y, particleSize, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  private addHeatWaves(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    fireColor: string
  ): void {
    ctx.save();
    
    const colors = this.getFireColors(fireColor);
    const time = Date.now() / 1000;

    // Heat distortion waves
    for (let wave = 0; wave < 8; wave++) {
      const waveY = height * 0.2 + wave * 60;
      const amplitude = 20 + wave * 5;
      
      ctx.strokeStyle = `${colors.heatWaves}40`;
      ctx.lineWidth = 2 + wave * 0.5;
      ctx.beginPath();
      
      for (let x = 0; x <= width; x += 10) {
        const waveOffset = Math.sin((x / 50) + time * 2 + wave) * amplitude;
        if (x === 0) {
          ctx.moveTo(x, waveY + waveOffset);
        } else {
          ctx.lineTo(x, waveY + waveOffset);
        }
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  private addFireRings(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    fireColor: string
  ): void {
    ctx.save();
    
    const colors = this.getFireColors(fireColor);
    const time = Date.now() / 1000;

    // Expanding fire rings
    for (let ring = 0; ring < 3; ring++) {
      const ringTime = time - ring * 0.5;
      const ringRadius = (ringTime * 100) % 300;
      const ringOpacity = Math.max(0, 1 - (ringRadius / 300));
      
      if (ringOpacity > 0) {
        ctx.strokeStyle = `${colors.expandingRings}${Math.floor(ringOpacity * 200).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(width/2, height/2, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  private drawFlame(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ): void {
    // Flame shape using bezier curves
    const flameGradient = ctx.createLinearGradient(x, y + height, x, y);
    flameGradient.addColorStop(0, color);
    flameGradient.addColorStop(0.5, `${color}CC`);
    flameGradient.addColorStop(1, `${color}66`);
    
    ctx.fillStyle = flameGradient;
    ctx.beginPath();
    ctx.moveTo(x, y + height);
    
    // Left side of flame
    ctx.quadraticCurveTo(x - width, y + height * 0.7, x - width * 0.5, y + height * 0.3);
    ctx.quadraticCurveTo(x - width * 0.3, y, x, y);
    
    // Right side of flame
    ctx.quadraticCurveTo(x + width * 0.3, y, x + width * 0.5, y + height * 0.3);
    ctx.quadraticCurveTo(x + width, y + height * 0.7, x, y + height);
    
    ctx.fill();
    
    // Inner flame
    ctx.fillStyle = `${color}AA`;
    ctx.beginPath();
    ctx.moveTo(x, y + height);
    ctx.quadraticCurveTo(x - width * 0.3, y + height * 0.8, x, y + height * 0.2);
    ctx.quadraticCurveTo(x + width * 0.3, y + height * 0.8, x, y + height);
    ctx.fill();
  }

  private getFireColors(fireColor: string): {
    background: { bottom: string; middle: string; top: string };
    backdrop: string;
    aura: { inner: string; middle: string; outer: string };
    rings: string;
    flames: string;
    embers: string;
    particles: { hot: string; warm: string; cool: string };
    heatWaves: string;
    expandingRings: string;
    glow: string;
  } {
    switch (fireColor.toLowerCase()) {
      case "blue":
        return {
          background: { bottom: "#001133", middle: "#002266", top: "#003399" },
          backdrop: "#4169E1",
          aura: { inner: "#0080FF", middle: "#0066CC", outer: "#004499" },
          rings: "#00BFFF",
          flames: "#1E90FF",
          embers: "#87CEEB",
          particles: { hot: "#00FFFF", warm: "#4169E1", cool: "#0080FF" },
          heatWaves: "#87CEEB",
          expandingRings: "#00BFFF",
          glow: "rgba(0, 191, 255"
        };
      case "green":
        return {
          background: { bottom: "#001100", middle: "#002200", top: "#003300" },
          backdrop: "#32CD32",
          aura: { inner: "#00FF80", middle: "#00CC66", outer: "#009944" },
          rings: "#00FF7F",
          flames: "#32CD32",
          embers: "#90EE90",
          particles: { hot: "#00FF00", warm: "#32CD32", cool: "#228B22" },
          heatWaves: "#90EE90",
          expandingRings: "#00FF7F",
          glow: "rgba(0, 255, 127"
        };
      case "purple":
        return {
          background: { bottom: "#220033", middle: "#330044", top: "#440055" },
          backdrop: "#9370DB",
          aura: { inner: "#DA70D6", middle: "#BA55D3", outer: "#8B008B" },
          rings: "#DDA0DD",
          flames: "#9370DB",
          embers: "#DDA0DD",
          particles: { hot: "#FF00FF", warm: "#DA70D6", cool: "#9370DB" },
          heatWaves: "#DDA0DD",
          expandingRings: "#DA70D6",
          glow: "rgba(218, 112, 214"
        };
      case "white":
        return {
          background: { bottom: "#222222", middle: "#444444", top: "#666666" },
          backdrop: "#F0F8FF",
          aura: { inner: "#FFFFFF", middle: "#E0E0E0", outer: "#C0C0C0" },
          rings: "#FFFFFF",
          flames: "#F0F8FF",
          embers: "#FFFAFA",
          particles: { hot: "#FFFFFF", warm: "#F5F5F5", cool: "#E0E0E0" },
          heatWaves: "#F0F8FF",
          expandingRings: "#FFFFFF",
          glow: "rgba(255, 255, 255"
        };
      case "gold":
        return {
          background: { bottom: "#332200", middle: "#554400", top: "#776600" },
          backdrop: "#FFD700",
          aura: { inner: "#FFFF00", middle: "#FFDD00", outer: "#FFAA00" },
          rings: "#FFA500",
          flames: "#FFD700",
          embers: "#FFFF66",
          particles: { hot: "#FFFF00", warm: "#FFD700", cool: "#DAA520" },
          heatWaves: "#FFFF99",
          expandingRings: "#FFA500",
          glow: "rgba(255, 215, 0"
        };
      case "red":
      default:
        return {
          background: { bottom: "#330000", middle: "#550000", top: "#770000" },
          backdrop: "#FF4500",
          aura: { inner: "#FF6600", middle: "#FF4400", outer: "#CC2200" },
          rings: "#FF4500",
          flames: "#FF6600",
          embers: "#FF8C00",
          particles: { hot: "#FFFF00", warm: "#FF6600", cool: "#FF4500" },
          heatWaves: "#FF8C00",
          expandingRings: "#FF4500",
          glow: "rgba(255, 69, 0"
        };
    }
  }
}