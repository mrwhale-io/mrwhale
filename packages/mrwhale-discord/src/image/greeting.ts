import axios from "axios";
import {
  createCanvas,
  loadImage,
  CanvasRenderingContext2D,
  Canvas,
} from "canvas";
import { AttachmentBuilder } from "discord.js";

import { applyText } from "../util/apply-text";

/**
 * A builder for creating a creating image for when user's join a guild.
 */
export class Greeting {
  private username: string;
  private avatarUrl: string;
  private guild: string;
  private message: string;
  private backgroundColour: string;
  private messageColour: string;
  private avatarColour: string;
  private secondaryBackgroundColour: string;
  private memberCount: number;
  private memberCountColour: string;

  setUsername(value: string): Greeting {
    this.username = value;
    return this;
  }

  setAvatarUrl(value: string): Greeting {
    this.avatarUrl = value;
    return this;
  }

  setBackgroundColour(value: string): Greeting {
    this.backgroundColour = value;
    return this;
  }

  setMessageColour(value: string): Greeting {
    this.messageColour = value;
    return this;
  }

  setGuild(value: string): Greeting {
    this.guild = value;
    return this;
  }

  setMemberCount(value: number): Greeting {
    this.memberCount = value;
    return this;
  }

  setMessage(value: string): Greeting {
    this.message = value;
    return this;
  }

  setAvatarColour(value: string): Greeting {
    this.avatarColour = value;
    return this;
  }

  setMemberCountColour(value: string): Greeting {
    this.memberCountColour = value;
    return this;
  }

  setSecondaryBackgroundColour(value: string): Greeting {
    this.secondaryBackgroundColour = value;
    return this;
  }

  /**
   * Builds the greeting card and returns as a discord attachment.
   */
  async build(): Promise<AttachmentBuilder> {
    const canvas = createCanvas(1200, 500);
    const ctx = canvas.getContext("2d");

    this.drawBackground(ctx, canvas);
    this.drawSecondaryBackground(ctx, canvas);
    this.drawMessage(ctx, canvas);
    await this.drawAvatar(ctx, canvas);

    const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
      name: "greeting.png",
    });

    return attachment;
  }

  private drawBackground(ctx: CanvasRenderingContext2D, canvas: Canvas) {
    ctx.fillStyle = this.backgroundColour;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  private drawSecondaryBackground(
    ctx: CanvasRenderingContext2D,
    canvas: Canvas
  ) {
    ctx.fillStyle = this.secondaryBackgroundColour;
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2.3);
  }

  private drawMessage(ctx: CanvasRenderingContext2D, canvas: Canvas) {
    const message = this.message
      .replace(/{guild.name}/g, this.guild)
      .replace(/{user.username}/g, this.username);
    const memberCount = `Member #${this.memberCount}`;
    const font = applyText(
      canvas,
      42,
      canvas.width - 200,
      message,
      "Bold sans-serif"
    );

    ctx.fillStyle = this.messageColour;
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height - 100);

    ctx.fillStyle = this.memberCountColour;
    ctx.fillText(memberCount, canvas.width / 2, canvas.height - 45);
  }

  private async drawAvatar(ctx: CanvasRenderingContext2D, canvas: Canvas) {
    const avatarFile = await axios.get(this.avatarUrl, {
      responseType: "arraybuffer",
    });
    const avatar = await loadImage(avatarFile.data);
    ctx.beginPath();
    ctx.lineWidth = 15;
    ctx.strokeStyle = this.avatarColour;
    ctx.arc(canvas.width / 2, canvas.height / 2.5, 115, 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
      avatar,
      canvas.width / 2 - 115,
      canvas.height / 2.5 - 115,
      230,
      230
    );

    return ctx;
  }
}
