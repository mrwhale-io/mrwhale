import { Canvas } from "canvas";

export const applyText = (canvas: Canvas, text: string): string => {
  const ctx = canvas.getContext("2d");

  // Declare a base size of the font
  let fontSize = 36;

  do {
    // Assign the font to the context and decrement it so it can be measured again
    ctx.font = `${(fontSize -= 2)}px sans-serif`;
  } while (ctx.measureText(text).width > canvas.width - 528);

  // Return the result to use in the actual canvas
  return ctx.font;
};
