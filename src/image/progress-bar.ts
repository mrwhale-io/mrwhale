import { Canvas } from "canvas";

interface ProgressBarOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  percentage: number;
  color: string;
  canvas: Canvas;
}

export class ProgressBar {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;

  get percentage(): number {
    return this._percentage * 100;
  }

  set percentage(x: number) {
    this._percentage = x / 100;
  }

  private canvas: Canvas;
  private progress: number;
  private _percentage: number;

  constructor(options: ProgressBarOptions) {
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.color = options.color;
    this._percentage = options.percentage / 100;
    this.canvas = options.canvas;
  }

  draw(): void {
    const ctx = this.canvas.getContext("2d");
    this.drawBackground();
    this.progress = this._percentage * this.width;
    if (this.progress <= this.height) {
      ctx.beginPath();
      ctx.arc(
        this.height / 2 + this.x,
        this.height / 2 + this.y,
        this.height / 2,
        Math.PI - Math.acos((this.height - this.progress) / this.height),
        Math.PI + Math.acos((this.height - this.progress) / this.height)
      );
      ctx.save();
      ctx.scale(-1, 1);
      ctx.arc(
        this.height / 2 - this.progress - this.x,
        this.height / 2 + this.y,
        this.height / 2,
        Math.PI - Math.acos((this.height - this.progress) / this.height),
        Math.PI + Math.acos((this.height - this.progress) / this.height)
      );
      ctx.restore();
      ctx.closePath();
    } else {
      ctx.beginPath();
      ctx.arc(
        this.height / 2 + this.x,
        this.height / 2 + this.y,
        this.height / 2,
        Math.PI / 2,
        (3 / 2) * Math.PI
      );
      ctx.lineTo(this.progress - this.height + this.x, 0 + this.y);
      ctx.arc(
        this.progress - this.height / 2 + this.x,
        this.height / 2 + this.y,
        this.height / 2,
        (3 / 2) * Math.PI,
        Math.PI / 2
      );
      ctx.lineTo(this.height / 2 + this.x, this.height + this.y);
      ctx.closePath();
    }
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  private drawBackground(): void {
    const ctx = this.canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(
      this.height / 2 + this.x,
      this.height / 2 + this.y,
      this.height / 2,
      Math.PI / 2,
      (3 / 2) * Math.PI
    );
    ctx.lineTo(this.width - this.height + this.x, 0 + this.y);
    ctx.arc(
      this.width - this.height / 2 + this.x,
      this.height / 2 + this.y,
      this.height / 2,
      (3 / 2) * Math.PI,
      Math.PI / 2
    );
    ctx.lineTo(this.height / 2 + this.x, this.height + this.y);
    ctx.fillStyle = "#201d27";
    ctx.fill();
    ctx.closePath();
  }
}
