import { drawHealthBar } from "./draw-health-bar";

/**
 * Draws the hunger level health bar with the percentage.
 *
 * @param hungerLevel The current hunger level to draw.
 * @returns The hunger level health bar with the percentage next to it.
 */
export function drawHungerHealthBar(hungerLevel: number): string {
  const healthBar = drawHealthBar(hungerLevel);
  const currentProgress = Math.floor((hungerLevel / 100) * 100);

  return `${healthBar} ${currentProgress}%`;
}
