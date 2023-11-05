import * as webp from "@cwasm/webp";
import { ImageData, createCanvas } from "canvas";

/**
 * Decodes a webp image file.
 * @param source The image source data.
 * @param ctx The canvas context.
 */
export function decodeWebpImage(source: Uint8Array): ImageData {
  const image = webp.decode(source);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(image.width, image.height);
  imageData.data.set(image.data);

  return imageData;
}
