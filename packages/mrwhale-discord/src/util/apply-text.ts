import { Canvas } from "canvas";

export const applyText = (
  canvas: Canvas,
  fontSize: number,
  width: number,
  text: string,
  font: string
): string => {
  const ctx = canvas.getContext("2d");

  do {
    // Assign the font to the context and decrement it so it can be measured again.
    ctx.font = `${(fontSize -= 2)}px ${font}`;
  } while (ctx.measureText(text).width > width);

  // Return the result to use in the actual canvas.
  return ctx.font;
};
