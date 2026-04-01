import { createCanvas, CanvasRenderingContext2D } from "canvas";

import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";
import { fetchImageFromUrl } from "../../util/fetch-image-from-url";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "matrix",
      description: "Enter the digital realm with Matrix code rain and cyberpunk effects! 🔢",
      type: "effects",
      usage: "<prefix>matrix @user [variant]",
      examples: ["matrix", "matrix @user", "matrix @user green", "matrix @user blue"],
      cooldown: 8000,
      requiresPremium: true,
      premiumTier: "premium",
    });
  }

  async action(message: Message, args: string[]): Promise<void> {
    const user = message.firstMentionOrAuthor;
    const variant = args.find(arg => 
      ["green", "blue", "red", "purple", "gold"].includes(arg.toLowerCase())
    ) || "green";
    
    const responseMsg = await message.reply(`🔢 Jacking into the Matrix... Loading digital reality with ${variant} code streams...`);

    try {
      const avatar = await fetchImageFromUrl(user.img_avatar);
      const canvas = createCanvas(600, 650);
      const ctx = canvas.getContext("2d");

      // Create Matrix effect
      this.createMatrixEffect(ctx, avatar, canvas.width, canvas.height, variant);

      return uploadImage(canvas, responseMsg);
    } catch (error) {
      this.botClient.logger.error("Matrix effect failed:", error);
      return responseMsg.edit("❌ Connection to the Matrix lost... Failed to load digital reality.");
    }
  }

  private createMatrixEffect(
    ctx: CanvasRenderingContext2D,
    avatar: any,
    width: number,
    height: number,
    variant: string
  ): void {
    // Digital background
    this.drawDigitalBackground(ctx, width, height, variant);

    // Matrix code rain backdrop
    this.addMatrixRain(ctx, width, height, variant);

    // Draw avatar with digital enhancement
    ctx.save();
    ctx.drawImage(avatar, 100, 100, 400, 400);
    
    // Apply digital glow effect
    const colors = this.getMatrixColors(variant);
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = `${colors.glow}20`;
    ctx.fillRect(100, 100, 400, 400);
    
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = `${colors.digitalOverlay}15`;
    ctx.fillRect(100, 100, 400, 400);
    ctx.restore();

    // Add scanning lines
    this.addScanningLines(ctx, width, height, variant);

    // Add digital grid overlay
    this.addDigitalGrid(ctx, width, height, variant);

    // Add floating code fragments
    this.addCodeFragments(ctx, width, height, variant);

    // Add data streams
    this.addDataStreams(ctx, width, height, variant);

    // Add digital particles
    this.addDigitalParticles(ctx, width, height, variant);

    // Add glitch effects
    this.addGlitchEffects(ctx, width, height, variant);

    // Add terminal windows
    this.addTerminalWindows(ctx, width, height, variant);
  }

  private drawDigitalBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    variant: string
  ): void {
    const colors = this.getMatrixColors(variant);
    
    // Digital gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, colors.background.top);
    gradient.addColorStop(0.3, colors.background.middle);
    gradient.addColorStop(0.7, colors.background.bottom);
    gradient.addColorStop(1, "#000000");
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add circuit pattern
    ctx.strokeStyle = `${colors.circuits}30`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      const x = (i / 10) * width;
      const y = (i / 10) * height;
      
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + Math.random() * 100 - 50, height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y + Math.random() * 100 - 50);
      ctx.stroke();
    }
  }

  private addMatrixRain(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    variant: string
  ): void {
    ctx.save();
    
    const colors = this.getMatrixColors(variant);
    const time = Date.now() / 1000;
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

    // Matrix rain columns
    const columnWidth = 20;
    const columns = Math.floor(width / columnWidth);
    
    for (let col = 0; col < columns; col++) {
      const x = col * columnWidth;
      const rainSpeed = 50 + Math.sin(time + col) * 20;
      const rainOffset = (time * rainSpeed + col * 100) % (height + 200);
      
      // Rain streak
      const streakLength = 100 + Math.sin(time + col) * 50;
      
      for (let i = 0; i < streakLength / 15; i++) {
        const y = rainOffset - i * 15;
        if (y > -20 && y < height + 20) {
          const char = characters[Math.floor((time * 10 + col + i) % characters.length)];
          const opacity = Math.max(0, 1 - (i / (streakLength / 15)));
          const intensity = opacity * (0.7 + Math.sin(time * 3 + col + i) * 0.3);
          
          ctx.fillStyle = i === 0 ? colors.rain.leading : 
                         i < 3 ? `${colors.rain.bright}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}` :
                         `${colors.rain.fading}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`;
          
          ctx.font = `${14 + i === 0 ? 4 : 0}px monospace`;
          ctx.fillText(char, x, y);
          
          // Leading character glow
          if (i === 0) {
            ctx.shadowColor = colors.rain.glow;
            ctx.shadowBlur = 8;
            ctx.fillText(char, x, y);
            ctx.shadowBlur = 0;
          }
        }
      }
    }

    ctx.restore();
  }

  private addScanningLines(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    variant: string
  ): void {
    ctx.save();
    
    const colors = this.getMatrixColors(variant);
    const time = Date.now() / 1000;

    // Horizontal scanning lines
    for (let i = 0; i < 3; i++) {
      const scanY = ((time * 100 + i * 200) % (height + 100)) - 50;
      const intensity = Math.sin(time * 4 + i) * 0.5 + 0.5;
      
      const gradient = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      gradient.addColorStop(0, `${colors.scanLines}00`);
      gradient.addColorStop(0.5, `${colors.scanLines}${Math.floor(intensity * 150).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(1, `${colors.scanLines}00`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanY - 20, width, 40);
    }

    // Vertical scanning beam
    const beamX = ((time * 150) % (width + 200)) - 100;
    const beamGradient = ctx.createLinearGradient(beamX - 30, 0, beamX + 30, 0);
    beamGradient.addColorStop(0, `${colors.scanBeam}00`);
    beamGradient.addColorStop(0.5, `${colors.scanBeam}80`);
    beamGradient.addColorStop(1, `${colors.scanBeam}00`);
    
    ctx.fillStyle = beamGradient;
    ctx.fillRect(beamX - 30, 0, 60, height);

    ctx.restore();
  }

  private addDigitalGrid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    variant: string
  ): void {
    ctx.save();
    
    const colors = this.getMatrixColors(variant);
    const time = Date.now() / 1000;
    const gridSize = 25;

    ctx.strokeStyle = `${colors.grid}40`;
    ctx.lineWidth = 0.5;

    // Animated grid
    for (let x = 0; x <= width; x += gridSize) {
      const flicker = 0.5 + Math.sin(time * 2 + x / 100) * 0.5;
      ctx.globalAlpha = flicker * 0.3;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      const flicker = 0.5 + Math.sin(time * 2 + y / 100) * 0.5;
      ctx.globalAlpha = flicker * 0.3;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Grid intersection points
    ctx.fillStyle = colors.gridNodes;
    for (let x = 0; x <= width; x += gridSize * 2) {
      for (let y = 0; y <= height; y += gridSize * 2) {
        const pulse = Math.sin(time * 3 + x / 50 + y / 50) * 0.5 + 0.5;
        ctx.globalAlpha = pulse * 0.6;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  private addCodeFragments(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    variant: string
  ): void {
    ctx.save();
    
    const colors = this.getMatrixColors(variant);
    const time = Date.now() / 1000;
    const codeFragments = ["void main()", "if(x>0)", "for(i=0;i<n;i++)", "print('hello')", "exit(1)", "malloc()", "free(ptr)", "NULL"];

    // Floating code fragments
    for (let i = 0; i < 15; i++) {
      const x = (Math.sin(time * 0.5 + i) * 0.5 + 0.5) * width;
      const y = (Math.cos(time * 0.3 + i * 1.2) * 0.5 + 0.5) * height;
      const fragment = codeFragments[i % codeFragments.length];
      const opacity = 0.3 + Math.sin(time * 2 + i) * 0.2;
      
      ctx.font = "12px monospace";
      ctx.fillStyle = `${colors.codeFragments}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
      ctx.fillText(fragment, x, y);
      
      // Occasional glow
      if (Math.sin(time * 4 + i) > 0.8) {
        ctx.shadowColor = colors.codeGlow;
        ctx.shadowBlur = 6;
        ctx.fillText(fragment, x, y);
        ctx.shadowBlur = 0;
      }
    }

    ctx.restore();
  }

  private addDataStreams(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    variant: string
  ): void {
    ctx.save();
    
    const colors = this.getMatrixColors(variant);
    const time = Date.now() / 1000;

    // Data streams around avatar
    for (let stream = 0; stream < 8; stream++) {
      const angle = (stream / 8) * Math.PI * 2 + time * 0.5;
      const radius = 180 + Math.sin(time + stream) * 30;
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Stream path
      const streamLength = 100;
      for (let point = 0; point < streamLength; point++) {
        const pointAngle = angle + (point / streamLength) * 0.5;
        const pointRadius = radius + point * 2;
        const x = centerX + Math.cos(pointAngle) * pointRadius;
        const y = centerY + Math.sin(pointAngle) * pointRadius;
        
        if (x >= 0 && x <= width && y >= 0 && y <= height) {
          const intensity = Math.max(0, 1 - (point / streamLength));
          const size = 1 + intensity * 2;
          
          ctx.fillStyle = point < 5 ? colors.streams.head : `${colors.streams.tail}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();
  }

  private addDigitalParticles(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    variant: string
  ): void {
    ctx.save();
    
    const colors = this.getMatrixColors(variant);
    const time = Date.now() / 1000;

    // Floating digital particles
    for (let i = 0; i < 50; i++) {
      const x = (Math.sin(time * 0.3 + i) * 0.5 + 0.5) * width;
      const y = (Math.cos(time * 0.2 + i * 1.5) * 0.5 + 0.5) * height;
      const size = 1 + Math.sin(time * 4 + i) * 1.5;
      const pulse = 0.3 + Math.sin(time * 6 + i) * 0.7;
      
      ctx.fillStyle = `${colors.particles}${Math.floor(pulse * 255).toString(16).padStart(2, '0')}`;
      ctx.shadowColor = colors.particleGlow;
      ctx.shadowBlur = 4;
      
      // Square particles for digital feel
      ctx.fillRect(x - size/2, y - size/2, size, size);
    }

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  private addGlitchEffects(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    variant: string
  ): void {
    ctx.save();
    
    const colors = this.getMatrixColors(variant);
    const time = Date.now() / 1000;

    // Random glitch bars
    if (Math.sin(time * 10) > 0.95) {
      for (let i = 0; i < 5; i++) {
        const y = Math.random() * height;
        const barHeight = 5 + Math.random() * 15;
        
        ctx.fillStyle = `${colors.glitch}60`;
        ctx.fillRect(0, y, width, barHeight);
        
        // RGB shift effect
        ctx.fillStyle = `${colors.glitchRed}30`;
        ctx.fillRect(2, y, width, barHeight);
        ctx.fillStyle = `${colors.glitchBlue}30`;
        ctx.fillRect(-2, y, width, barHeight);
      }
    }

    ctx.restore();
  }

  private addTerminalWindows(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    variant: string
  ): void {
    ctx.save();
    
    const colors = this.getMatrixColors(variant);
    const time = Date.now() / 1000;

    // Floating terminal windows
    for (let term = 0; term < 3; term++) {
      const x = 50 + term * 180 + Math.sin(time + term) * 20;
      const y = 50 + Math.cos(time * 0.8 + term) * 30;
      const termWidth = 120;
      const termHeight = 80;
      const opacity = 0.2 + Math.sin(time * 2 + term) * 0.1;
      
      // Terminal background
      ctx.fillStyle = `${colors.terminal.bg}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
      ctx.fillRect(x, y, termWidth, termHeight);
      
      // Terminal border
      ctx.strokeStyle = `${colors.terminal.border}${Math.floor((opacity + 0.2) * 255).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, termWidth, termHeight);
      
      // Terminal text lines
      ctx.font = "8px monospace";
      ctx.fillStyle = `${colors.terminal.text}${Math.floor((opacity + 0.3) * 255).toString(16).padStart(2, '0')}`;
      
      const lines = ["C:\\>", "Loading...", "Access granted", "Data stream active"];
      for (let line = 0; line < lines.length; line++) {
        ctx.fillText(lines[line], x + 5, y + 15 + line * 12);
      }
      
      // Cursor blink
      if (Math.sin(time * 8) > 0) {
        ctx.fillStyle = colors.terminal.cursor;
        ctx.fillRect(x + 5 + lines[3].length * 5, y + 15 + 3 * 12 - 8, 6, 10);
      }
    }

    ctx.restore();
  }

  private getMatrixColors(variant: string): {
    background: { top: string; middle: string; bottom: string };
    circuits: string;
    rain: { leading: string; bright: string; fading: string; glow: string };
    scanLines: string;
    scanBeam: string;
    grid: string;
    gridNodes: string;
    codeFragments: string;
    codeGlow: string;
    streams: { head: string; tail: string };
    particles: string;
    particleGlow: string;
    glitch: string;
    glitchRed: string;
    glitchBlue: string;
    terminal: { bg: string; border: string; text: string; cursor: string };
    glow: string;
    digitalOverlay: string;
  } {
    switch (variant.toLowerCase()) {
      case "blue":
        return {
          background: { top: "#000033", middle: "#000066", bottom: "#000099" },
          circuits: "#0080FF",
          rain: { leading: "#00FFFF", bright: "#0080FF", fading: "#004080", glow: "#00FFFF" },
          scanLines: "#0080FF",
          scanBeam: "#00BFFF",
          grid: "#0066CC",
          gridNodes: "#00BFFF",
          codeFragments: "#4169E1",
          codeGlow: "#00FFFF",
          streams: { head: "#00FFFF", tail: "#0080FF" },
          particles: "#87CEEB",
          particleGlow: "#00FFFF",
          glitch: "#00FFFF",
          glitchRed: "#FF0080",
          glitchBlue: "#0080FF",
          terminal: { bg: "#000066", border: "#0080FF", text: "#00BFFF", cursor: "#00FFFF" },
          glow: "rgba(0, 191, 255, ",
          digitalOverlay: "rgba(0, 128, 255, "
        };
      case "red":
        return {
          background: { top: "#330000", middle: "#660000", bottom: "#990000" },
          circuits: "#FF4500",
          rain: { leading: "#FF0000", bright: "#FF4500", fading: "#800000", glow: "#FF0000" },
          scanLines: "#FF4500",
          scanBeam: "#FF6347",
          grid: "#CC0000",
          gridNodes: "#FF4500",
          codeFragments: "#DC143C",
          codeGlow: "#FF0000",
          streams: { head: "#FF0000", tail: "#FF4500" },
          particles: "#FFB6C1",
          particleGlow: "#FF0000",
          glitch: "#FF0000",
          glitchRed: "#FF0000",
          glitchBlue: "#0080FF",
          terminal: { bg: "#660000", border: "#FF4500", text: "#FF6347", cursor: "#FF0000" },
          glow: "rgba(255, 69, 0, ",
          digitalOverlay: "rgba(255, 0, 0, "
        };
      case "purple":
        return {
          background: { top: "#330033", middle: "#660066", bottom: "#990099" },
          circuits: "#9370DB",
          rain: { leading: "#FF00FF", bright: "#DA70D6", fading: "#800080", glow: "#FF00FF" },
          scanLines: "#DA70D6",
          scanBeam: "#DDA0DD",
          grid: "#8B008B",
          gridNodes: "#DA70D6",
          codeFragments: "#9370DB",
          codeGlow: "#FF00FF",
          streams: { head: "#FF00FF", tail: "#DA70D6" },
          particles: "#DDA0DD",
          particleGlow: "#FF00FF",
          glitch: "#FF00FF",
          glitchRed: "#FF0080",
          glitchBlue: "#8000FF",
          terminal: { bg: "#660066", border: "#DA70D6", text: "#DDA0DD", cursor: "#FF00FF" },
          glow: "rgba(218, 112, 214, ",
          digitalOverlay: "rgba(255, 0, 255, "
        };
      case "gold":
        return {
          background: { top: "#332200", middle: "#664400", bottom: "#996600" },
          circuits: "#FFD700",
          rain: { leading: "#FFFF00", bright: "#FFD700", fading: "#B8860B", glow: "#FFFF00" },
          scanLines: "#FFD700",
          scanBeam: "#FFFFE0",
          grid: "#DAA520",
          gridNodes: "#FFD700",
          codeFragments: "#F0E68C",
          codeGlow: "#FFFF00",
          streams: { head: "#FFFF00", tail: "#FFD700" },
          particles: "#FFFFE0",
          particleGlow: "#FFFF00",
          glitch: "#FFFF00",
          glitchRed: "#FF8000",
          glitchBlue: "#0080FF",
          terminal: { bg: "#664400", border: "#FFD700", text: "#FFFFE0", cursor: "#FFFF00" },
          glow: "rgba(255, 215, 0, ",
          digitalOverlay: "rgba(255, 255, 0, "
        };
      case "green":
      default:
        return {
          background: { top: "#001100", middle: "#002200", bottom: "#003300" },
          circuits: "#00FF00",
          rain: { leading: "#00FF00", bright: "#00FF41", fading: "#008000", glow: "#00FF00" },
          scanLines: "#00FF41",
          scanBeam: "#00FF7F",
          grid: "#008000",
          gridNodes: "#00FF41",
          codeFragments: "#32CD32",
          codeGlow: "#00FF00",
          streams: { head: "#00FF00", tail: "#00FF41" },
          particles: "#90EE90",
          particleGlow: "#00FF00",
          glitch: "#00FF00",
          glitchRed: "#FF0000",
          glitchBlue: "#0000FF",
          terminal: { bg: "#002200", border: "#00FF41", text: "#00FF7F", cursor: "#00FF00" },
          glow: "rgba(0, 255, 65, ",
          digitalOverlay: "rgba(0, 255, 0, "
        };
    }
  }
}
