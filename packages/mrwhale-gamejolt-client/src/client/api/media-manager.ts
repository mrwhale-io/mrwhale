import { Readable } from "stream";
import * as FormData from "form-data";

import { Endpoints } from "../../constants";
import { MediaItem } from "../../structures/media-item";
import { APIRequestManager } from "./api-request-manager";
import { ApiData } from "../../types/api-data";

/**
 * API request manager for uploading media to Game Jolt.
 */
export class MediaManager extends APIRequestManager {
  /**
   * Uploads a media item to Game Jolt.
   * @param file The file to upload.
   * @param parentId The parent identifier of the media item.
   * @param type The type of media to upload.
   * @returns The media item that was uploaded.
   */
  async uploadMedia(
    file: Readable,
    parentId: number,
    type: string
  ): Promise<MediaItem> {
    const url = Endpoints.media_upload;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("parent_id", parentId.toString());

    const result = await this.axios.post(url, formData, {
      maxContentLength: Infinity,
      headers: {
        "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
      },
    });

    const payload = result.data.payload;

    if (payload.success && payload.mediaItem) {
      return new MediaItem(payload.mediaItem);
    } else if (!payload.success && payload.errors.file) {
      const mediaItemsResult = await this.axios.post(Endpoints.media_items, {
        type,
        parent_id: parentId,
      });
      const sizePayload = mediaItemsResult.data.payload;
      const maxWidth = sizePayload.maxWidth;
      const maxHeight = sizePayload.maxHeight;
      const maxFilesize = sizePayload.maxFilesize;

      throw new Error(
        `File size must be less than ${maxFilesize} bytes and dimensions less than ${maxWidth}×${maxHeight} pixels.`
      );
    }

    throw new Error(
      `General failure while uploading file. Status: ${result.status} ${result.statusText}`
    );
  }

  /**
   * Create a temp chat resource.
   * @param roomId The identifier of the room.
   */
  async chatTempResource(roomId: number): Promise<ApiData<{ id: string }>> {
    return await this.post<ApiData<{ id: string }>>(
      Endpoints.temp_resource("chat-message"),
      {
        roomId,
      }
    );
  }
}
