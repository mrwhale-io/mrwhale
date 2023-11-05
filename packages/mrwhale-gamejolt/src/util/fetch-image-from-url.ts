import axios from "axios";
import { Image, createCanvas, loadImage } from "canvas";

import { decodeWebpImage } from "./decode-webp-image";

/**
 * Fetch an image from a url and convert to a canvas image.
 * @param imageUrl The url of the image file.
 */
export async function fetchImageFromUrl(imageUrl: string): Promise<Image> {
  const avatarFile = await axios.get(imageUrl, {
    responseType: "arraybuffer",
  });

  if (!imageUrl.endsWith(".webp")) {
    return await loadImage(avatarFile.data);
  }

  const imageData = decodeWebpImage(avatarFile.data);
  const canvas = createCanvas(imageData.width, imageData.height);
  const ctx = canvas.getContext("2d");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx.putImageData(imageData, 0, 0);

  const image = new Image();
  image.src = canvas.toDataURL();

  return image;
}
