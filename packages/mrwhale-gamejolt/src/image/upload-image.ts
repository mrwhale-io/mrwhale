import { Content, Message } from "@mrwhale-io/gamejolt-client";
import { Canvas } from "canvas";
import * as fs from "fs";
import { file } from "tmp-promise";

/**
 * Upload and insert image on a message.
 *
 * @param canvas The canvas create the PNG with.
 * @param responseMsg The message to respond to.
 */
export async function uploadImage(
  canvas: Canvas,
  responseMsg: Message
): Promise<void> {
  const content = new Content();
  const { path, cleanup } = await file({ postfix: ".png" });
  const out = fs.createWriteStream(path);
  const stream = canvas.createPNGStream();
  stream.pipe(out);

  try {
    out.on("finish", async () => {
      const mediaItem = await responseMsg.client.chat.uploadFile(
        fs.createReadStream(path),
        responseMsg.room_id
      );

      await content.insertImage(mediaItem);
      responseMsg.edit(content);

      cleanup();
    });
  } catch (e) {
    responseMsg.edit("Could not create image.");
  }
}
