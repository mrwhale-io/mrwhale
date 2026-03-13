import { Canvas } from "canvas";

/**
 * Defines the options for creating a ProgressBar instance, including position, size, colors, percentage, and the canvas to draw on.
 */
interface ProgressBarOptions {
  /** The x-coordinate of the progress bar's top-left corner */
  x: number;
  /** The y-coordinate of the progress bar's top-left corner */
  y: number;
  /** The width of the progress bar */
  width: number;
  /** The height of the progress bar */
  height: number;
  /** The percentage of the progress bar to fill (0-100) */
  percentage: number;
  /** The color of the progress bar */
  color: string;
  /** The background color of the progress bar */
  backgroundColor: string;
  /** The canvas on which to draw the progress bar */
  canvas: Canvas;
}

/**
 * Represents a progress bar that can be drawn on a canvas.
 * The progress bar is drawn as a rounded rectangle that fills up based on the percentage value.
 */
export class ProgressBar {
  /** The x-coordinate of the progress bar's top-left corner */
  x: number;
  /** The y-coordinate of the progress bar's top-left corner */
  y: number;
  /** The width of the progress bar */
  width: number;
  /** The height of the progress bar */
  height: number;
  /** The color of the progress bar */
  color: string;
  /** The background color of the progress bar */
  backgroundColor: string;

  /** The current percentage of the progress bar (0-100) */
  get percentage(): number {
    return this._percentage * 100;
  }

  /**
   * Sets the percentage of the progress bar.
   * The input value should be between 0 and 100, and it will be internally stored as a decimal (0-1) for drawing purposes.
   *
   * @param x - The percentage value to set for the progress bar (0-100)
   */
  set percentage(x: number) {
    this._percentage = x / 100;
  }

  private canvas: Canvas;
  private progress: number;
  private _percentage: number;

  /**
   * Creates a new ProgressBar instance with the specified options.
   *
   * @param options - An object containing the configuration options for the progress bar, including position, size, colors, percentage, and canvas.
   */
  constructor(options: ProgressBarOptions) {
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.color = options.color;
    this._percentage = options.percentage / 100;
    this.canvas = options.canvas;
    this.backgroundColor = options.backgroundColor;
  }

  /**
   * Draws the progress bar on the canvas based on the current percentage value.
   * The method first draws the background of the progress bar, then calculates the filled portion based on the percentage and draws it accordingly.
   * The progress bar is drawn as a rounded rectangle that fills up from left to right as the percentage increases.
   */
  draw(): void {
    const ctx = this.canvas.getContext("2d");
    this.drawBackground();
    this.progress = this._percentage * this.width;
    if (this.progress <= this.height) {
      ctx.beginPath();
      // Draw the left rounded end of the progress bar
      ctx.arc(
        this.height / 2 + this.x,
        this.height / 2 + this.y,
        this.height / 2,
        Math.PI - Math.acos((this.height - this.progress) / this.height),
        Math.PI + Math.acos((this.height - this.progress) / this.height),
      );
      ctx.save();
      ctx.scale(-1, 1);

      // Draw the right rounded end of the progress bar, mirrored horizontally
      ctx.arc(
        this.height / 2 - this.progress - this.x,
        this.height / 2 + this.y,
        this.height / 2,
        Math.PI - Math.acos((this.height - this.progress) / this.height),
        Math.PI + Math.acos((this.height - this.progress) / this.height),
      );
      ctx.restore();
      ctx.closePath();
    } else {
      // Draw the progress bar with a filled portion that exceeds the height, creating a full rounded rectangle
      ctx.beginPath();
      ctx.arc(
        this.height / 2 + this.x,
        this.height / 2 + this.y,
        this.height / 2,
        Math.PI / 2,
        (3 / 2) * Math.PI,
      );
      ctx.lineTo(this.progress - this.height + this.x, 0 + this.y);
      ctx.arc(
        this.progress - this.height / 2 + this.x,
        this.height / 2 + this.y,
        this.height / 2,
        (3 / 2) * Math.PI,
        Math.PI / 2,
      );
      ctx.lineTo(this.height / 2 + this.x, this.height + this.y);
      ctx.closePath();
    }
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  /**
   * Draws the background of the progress bar as a rounded rectangle that spans the full width and height of the progress bar area.
   * The background is drawn first to provide a base for the progress fill, and it uses the specified background color.
   * The method calculates the rounded corners and fills the entire area of the progress bar, ensuring that the progress fill will be drawn on top of it correctly.
   */
  private drawBackground(): void {
    const ctx = this.canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(
      this.height / 2 + this.x,
      this.height / 2 + this.y,
      this.height / 2,
      Math.PI / 2,
      (3 / 2) * Math.PI,
    );
    ctx.lineTo(this.width - this.height + this.x, 0 + this.y);
    ctx.arc(
      this.width - this.height / 2 + this.x,
      this.height / 2 + this.y,
      this.height / 2,
      (3 / 2) * Math.PI,
      Math.PI / 2,
    );
    ctx.lineTo(this.height / 2 + this.x, this.height + this.y);
    ctx.fillStyle = this.backgroundColor;
    ctx.fill();
    ctx.closePath();
  }
}
