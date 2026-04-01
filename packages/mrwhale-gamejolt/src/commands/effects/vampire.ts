import { createCanvas, CanvasRenderingContext2D } from "canvas";

import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { uploadImage } from "../../image/upload-image";
import { fetchImageFromUrl } from "../../util/fetch-image-from-url";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "vampire",
      description:
        "Embrace the eternal night! Transform into a gothic vampire with cape, fangs, and dark powers! 🧛‍♂️",
      type: "image",
      usage: "<prefix>vampire @user",
      examples: ["vampire", "vampire @user"],
      cooldown: 8000,
      premium: true,
    });
  }

  async action(message: Message): Promise<void> {
    const user = message.firstMentionOrAuthor;
    const responseMsg = await message.reply(
      "🧛‍♂️ Awakening ancient powers and embracing the darkness...",
    );

    try {
      const avatar = await fetchImageFromUrl(user.img_avatar);
      const canvas = createCanvas(550, 600);
      const ctx = canvas.getContext("2d");

      // Create vampire transformation
      this.createVampireCostume(ctx, avatar, canvas.width, canvas.height);

      return uploadImage(canvas, responseMsg);
    } catch (error) {
      this.botClient.logger.error("Vampire transformation failed:", error);
      return responseMsg.edit(
        "❌ The sun's rays banish the transformation... Failed to become vampire.",
      );
    }
  }

  private createVampireCostume(
    ctx: CanvasRenderingContext2D,
    avatar: any,
    width: number,
    height: number,
  ): void {
    // Gothic castle background
    this.drawGothicBackground(ctx, width, height);

    // Draw vampire cape (behind avatar)
    this.drawVampireCape(ctx, width, height);

    // Draw avatar with pale vampire effect
    ctx.save();
    ctx.drawImage(avatar, 75, 75, 400, 400);

    // Apply pale vampire skin effect manually
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgba(220, 220, 240, 0.7)"; // Pale, desaturated effect
    ctx.fillRect(75, 75, 400, 400);

    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)"; // Slight contrast boost
    ctx.fillRect(75, 75, 400, 400);
    ctx.restore();

    // Add vampire fangs
    this.drawVampireFangs(ctx, width, height);

    // Add glowing red eyes
    this.drawVampireEyes(ctx, width, height);

    // Add gothic elements
    this.addGothicEffects(ctx, width, height);

    // Add blood effects
    this.addBloodEffects(ctx, width, height);

    // Add bat swarm
    this.addBatSwarm(ctx, width, height);

    // Add dark aura
    this.addDarkAura(ctx, width, height);
  }

  private drawGothicBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    // Dark gothic gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#2C0A0A"); // Dark red
    gradient.addColorStop(0.3, "#1A0A1A"); // Dark purple
    gradient.addColorStop(0.7, "#0A0A2C"); // Dark blue
    gradient.addColorStop(1, "#000000"); // Black

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add gothic castle silhouette
    this.drawCastleSilhouette(ctx, width, height);

    // Add full moon with clouds
    this.drawBloodMoon(ctx, width, height);

    // Add graveyard elements
    this.drawGraveyardSilhouettes(ctx, width, height);
  }

  private drawVampireCape(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();

    // Dramatic flowing cape
    const capeGradient = ctx.createRadialGradient(
      width * 0.5,
      height * 0.3,
      0,
      width * 0.5,
      height * 0.7,
      200,
    );
    capeGradient.addColorStop(0, "#4A0000"); // Dark red
    capeGradient.addColorStop(0.5, "#2F0000"); // Darker red
    capeGradient.addColorStop(1, "#1A0000"); // Very dark red

    ctx.fillStyle = capeGradient;

    // Cape exterior (dramatic flowing shape)
    ctx.beginPath();
    ctx.moveTo(width * 0.1, height * 0.4);
    ctx.quadraticCurveTo(
      width * 0.2,
      height * 0.35,
      width * 0.35,
      height * 0.45,
    );
    ctx.quadraticCurveTo(
      width * 0.5,
      height * 0.5,
      width * 0.65,
      height * 0.45,
    );
    ctx.quadraticCurveTo(width * 0.8, height * 0.35, width * 0.9, height * 0.4);
    ctx.lineTo(width * 0.95, height);
    ctx.lineTo(width * 0.05, height);
    ctx.closePath();
    ctx.fill();

    // Cape interior (red lining)
    ctx.fillStyle = "#8B0000"; // Darker red lining
    ctx.beginPath();
    ctx.moveTo(width * 0.15, height * 0.42);
    ctx.quadraticCurveTo(
      width * 0.5,
      height * 0.52,
      width * 0.85,
      height * 0.42,
    );
    ctx.lineTo(width * 0.8, height * 0.85);
    ctx.lineTo(width * 0.2, height * 0.85);
    ctx.closePath();
    ctx.fill();

    // Cape collar/clasp
    ctx.fillStyle = "#C0C0C0"; // Silver
    ctx.strokeStyle = "#808080";
    ctx.lineWidth = 2;

    // Ornate clasp
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.4, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Gothic design on clasp
    ctx.fillStyle = "#8B0000";
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height * 0.395);
    ctx.lineTo(width * 0.495, height * 0.405);
    ctx.lineTo(width * 0.505, height * 0.405);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private drawVampireFangs(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();

    // Vampire fangs
    ctx.fillStyle = "#FFFAF0"; // Ivory white
    ctx.strokeStyle = "#E0E0E0";
    ctx.lineWidth = 1;

    // Left fang
    ctx.beginPath();
    ctx.moveTo(width * 0.47, height * 0.3);
    ctx.lineTo(width * 0.465, height * 0.32);
    ctx.lineTo(width * 0.475, height * 0.32);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right fang
    ctx.beginPath();
    ctx.moveTo(width * 0.53, height * 0.3);
    ctx.lineTo(width * 0.525, height * 0.32);
    ctx.lineTo(width * 0.535, height * 0.32);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Subtle blood drop on fangs
    ctx.fillStyle = "#8B0000";
    ctx.beginPath();
    ctx.arc(width * 0.47, height * 0.32, 1, 0, Math.PI * 2);
    ctx.arc(width * 0.53, height * 0.32, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawVampireEyes(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();

    // Glowing red vampire eyes
    ctx.shadowColor = "#FF0000";
    ctx.shadowBlur = 15;

    // Eye glow background
    ctx.fillStyle = "#FF4444";
    ctx.beginPath();
    ctx.ellipse(width * 0.435, height * 0.21, 8, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(width * 0.565, height * 0.21, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Intense red pupils
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#CC0000";
    ctx.beginPath();
    ctx.ellipse(width * 0.435, height * 0.21, 4, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(width * 0.565, height * 0.21, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bright center
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.ellipse(width * 0.435, height * 0.21, 1, 1, 0, 0, Math.PI * 2);
    ctx.ellipse(width * 0.565, height * 0.21, 1, 1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private addGothicEffects(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();

    // Floating gothic symbols and runes
    const symbols = [
      { x: width * 0.15, y: height * 0.2, symbol: "†" }, // Cross
      { x: width * 0.85, y: height * 0.25, symbol: "⚰" }, // Coffin
      { x: width * 0.1, y: height * 0.6, symbol: "☠" }, // Skull
      { x: width * 0.9, y: height * 0.55, symbol: "🕯" }, // Candle
    ];

    ctx.fillStyle = "rgba(139, 0, 0, 0.6)";
    ctx.font = "20px serif";
    ctx.textAlign = "center";

    symbols.forEach((sym, index) => {
      const time = Date.now() / 1000;
      const float = Math.sin(time + index) * 5;
      const opacity = 0.4 + Math.sin(time + index) * 0.2;

      ctx.globalAlpha = opacity;
      ctx.fillText(sym.symbol, sym.x, sym.y + float);
    });

    ctx.globalAlpha = 1;

    // Dark energy wisps
    for (let i = 0; i < 10; i++) {
      const time = Date.now() / 1000;
      const x = width * (0.1 + Math.sin(time + i) * 0.4 + 0.3);
      const y = height * (0.1 + Math.cos(time + i * 1.5) * 0.4 + 0.4);
      const size = 2 + Math.sin(time + i) * 2;

      ctx.fillStyle = `rgba(139, 0, 0, ${0.3 + Math.sin(time + i) * 0.2})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private addBloodEffects(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();

    // Blood drips
    const bloodDrops = [
      { x: width * 0.45, startY: height * 0.32, endY: height * 0.4 },
      { x: width * 0.55, startY: height * 0.32, endY: height * 0.38 },
    ];

    ctx.fillStyle = "#8B0000";
    bloodDrops.forEach((drop) => {
      // Blood drip shape
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.startY);
      ctx.quadraticCurveTo(
        drop.x - 2,
        (drop.startY + drop.endY) / 2,
        drop.x,
        drop.endY,
      );
      ctx.quadraticCurveTo(
        drop.x + 2,
        (drop.startY + drop.endY) / 2,
        drop.x,
        drop.startY,
      );
      ctx.fill();

      // Blood drop at end
      ctx.beginPath();
      ctx.arc(drop.x, drop.endY, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Blood splatter effects
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * width;
      const y = height * (0.7 + Math.random() * 0.3);
      const size = Math.random() * 3 + 1;

      ctx.fillStyle = `rgba(139, 0, 0, ${0.2 + Math.random() * 0.4})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private addBatSwarm(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();

    // Flying bats
    const batCount = 12;
    const time = Date.now() / 1000;

    for (let i = 0; i < batCount; i++) {
      const x = (Math.sin(time * 0.5 + i) + 1) * width * 0.4 + width * 0.1;
      const y =
        (Math.cos(time * 0.3 + i * 1.2) + 1) * height * 0.2 + height * 0.1;
      const wingFlap = Math.sin(time * 10 + i) * 0.3 + 0.7;

      this.drawBat(ctx, x, y, 8 * wingFlap, i);
    }

    ctx.restore();
  }

  private drawBat(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    wingSpan: number,
    phase: number,
  ): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(phase * 0.1);

    ctx.fillStyle = "rgba(20, 20, 20, 0.8)";

    // Bat body
    ctx.beginPath();
    ctx.ellipse(0, 0, 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bat wings
    ctx.beginPath();
    // Left wing
    ctx.moveTo(-2, 0);
    ctx.quadraticCurveTo(
      -wingSpan,
      -wingSpan * 0.5,
      -wingSpan * 0.7,
      wingSpan * 0.3,
    );
    ctx.quadraticCurveTo(-wingSpan * 0.3, wingSpan * 0.1, -2, 2);

    // Right wing
    ctx.moveTo(2, 0);
    ctx.quadraticCurveTo(
      wingSpan,
      -wingSpan * 0.5,
      wingSpan * 0.7,
      wingSpan * 0.3,
    );
    ctx.quadraticCurveTo(wingSpan * 0.3, wingSpan * 0.1, 2, 2);

    ctx.fill();

    // Bat eyes
    ctx.fillStyle = "#FF0000";
    ctx.beginPath();
    ctx.arc(-1, -1, 0.5, 0, Math.PI * 2);
    ctx.arc(1, -1, 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private addDarkAura(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();

    // Pulsing dark aura
    const time = Date.now() / 1000;
    const pulseIntensity = 0.15 + Math.sin(time * 2) * 0.05;

    const auraGradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      50,
      width / 2,
      height / 2,
      250,
    );
    auraGradient.addColorStop(0, `rgba(139, 0, 0, ${pulseIntensity})`);
    auraGradient.addColorStop(0.7, `rgba(69, 0, 0, ${pulseIntensity * 0.5})`);
    auraGradient.addColorStop(1, "rgba(34, 0, 0, 0)");

    ctx.fillStyle = auraGradient;
    ctx.fillRect(0, 0, width, height);

    // Dark energy particles
    for (let i = 0; i < 20; i++) {
      const particleX = width * 0.3 + Math.sin(time + i) * width * 0.2;
      const particleY = height * 0.3 + Math.cos(time * 1.5 + i) * height * 0.2;
      const size = 1 + Math.sin(time * 3 + i) * 2;
      const opacity = 0.3 + Math.sin(time * 2 + i) * 0.2;

      ctx.fillStyle = `rgba(139, 0, 0, ${opacity})`;
      ctx.beginPath();
      ctx.arc(particleX, particleY, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawBloodMoon(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();

    // Blood moon
    const moonGradient = ctx.createRadialGradient(
      width * 0.8,
      height * 0.15,
      0,
      width * 0.8,
      height * 0.15,
      35,
    );
    moonGradient.addColorStop(0, "#FF6666");
    moonGradient.addColorStop(0.7, "#CC3333");
    moonGradient.addColorStop(1, "#990000");

    ctx.fillStyle = moonGradient;
    ctx.shadowColor = "#FF0000";
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.15, 30, 0, Math.PI * 2);
    ctx.fill();

    // Dark clouds partially covering moon
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(20, 20, 20, 0.6)";
    ctx.beginPath();
    ctx.arc(width * 0.75, height * 0.12, 25, 0, Math.PI * 2);
    ctx.arc(width * 0.85, height * 0.18, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawCastleSilhouette(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";

    // Gothic castle silhouette in background
    ctx.beginPath();
    // Main castle structure
    ctx.moveTo(width * 0.1, height * 0.4);
    ctx.lineTo(width * 0.15, height * 0.25);
    ctx.lineTo(width * 0.2, height * 0.3);
    ctx.lineTo(width * 0.3, height * 0.2);
    ctx.lineTo(width * 0.35, height * 0.25);
    ctx.lineTo(width * 0.4, height * 0.15);
    ctx.lineTo(width * 0.45, height * 0.2);
    ctx.lineTo(width * 0.5, height * 0.25);
    ctx.lineTo(width * 0.55, height * 0.2);
    ctx.lineTo(width * 0.6, height * 0.15);
    ctx.lineTo(width * 0.65, height * 0.25);
    ctx.lineTo(width * 0.7, height * 0.2);
    ctx.lineTo(width * 0.8, height * 0.3);
    ctx.lineTo(width * 0.85, height * 0.25);
    ctx.lineTo(width * 0.9, height * 0.4);
    ctx.lineTo(width * 0.9, height);
    ctx.lineTo(width * 0.1, height);
    ctx.closePath();
    ctx.fill();

    // Castle towers with pointed tops
    const towers = [
      { x: width * 0.18, y: height * 0.25, height: height * 0.15 },
      { x: width * 0.42, y: height * 0.15, height: height * 0.2 },
      { x: width * 0.62, y: height * 0.15, height: height * 0.18 },
      { x: width * 0.82, y: height * 0.25, height: height * 0.15 },
    ];

    towers.forEach((tower) => {
      ctx.beginPath();
      ctx.moveTo(tower.x - 8, tower.y);
      ctx.lineTo(tower.x, tower.y - tower.height * 0.3);
      ctx.lineTo(tower.x + 8, tower.y);
      ctx.closePath();
      ctx.fill();
    });

    ctx.restore();
  }

  private drawGraveyardSilhouettes(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";

    // Graveyard tombstones
    const tombstones = [
      { x: width * 0.05, y: height * 0.75, width: 8, height: 25 },
      { x: width * 0.12, y: height * 0.8, width: 6, height: 20 },
      { x: width * 0.88, y: height * 0.78, width: 10, height: 22 },
      { x: width * 0.95, y: height * 0.82, width: 7, height: 18 },
    ];

    tombstones.forEach((tomb) => {
      // Tombstone body
      ctx.fillRect(
        tomb.x - tomb.width / 2,
        tomb.y - tomb.height,
        tomb.width,
        tomb.height,
      );

      // Rounded top
      ctx.beginPath();
      ctx.arc(tomb.x, tomb.y - tomb.height, tomb.width / 2, 0, Math.PI, true);
      ctx.fill();

      // Cross on some tombstones
      if (Math.random() > 0.5) {
        ctx.fillRect(
          tomb.x - 1,
          tomb.y - tomb.height * 0.8,
          2,
          tomb.height * 0.4,
        );
        ctx.fillRect(tomb.x - 3, tomb.y - tomb.height * 0.7, 6, 2);
      }
    });

    // Dead trees
    ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
    ctx.lineWidth = 4;

    const trees = [
      { x: width * 0.08, y: height * 0.9, height: height * 0.3 },
      { x: width * 0.92, y: height * 0.85, height: height * 0.25 },
    ];

    trees.forEach((tree) => {
      // Tree trunk
      ctx.beginPath();
      ctx.moveTo(tree.x, tree.y);
      ctx.lineTo(tree.x, tree.y - tree.height);
      ctx.stroke();

      // Dead branches
      for (let i = 0; i < 5; i++) {
        const branchY = tree.y - tree.height * (0.3 + i * 0.15);
        const branchLength = (Math.random() * 20 + 10) * (1 - i * 0.2);
        const angle = (Math.random() - 0.5) * Math.PI * 0.8;

        ctx.beginPath();
        ctx.moveTo(tree.x, branchY);
        ctx.lineTo(
          tree.x + Math.cos(angle) * branchLength,
          branchY + Math.sin(angle) * branchLength,
        );
        ctx.stroke();
      }
    });

    ctx.restore();
  }
}
