import { Readable } from "stream";
import * as FormData from "form-data";

import { Endpoints } from "../../constants";
import { MediaItem } from "../../structures/media-item";
import { APIRequestManager } from "./api-request-manager";
import { ApiData } from "../../types/api-data";

/**
 * API manager for Game Jolt media upload and management operations.
 * 
 * The MediaManager handles all operations related to uploading and managing media files
 * on the Game Jolt platform, including images, videos, and other content assets.
 * 
 * ## Features:
 * - **Media Upload**: Upload images, videos, and other media files
 * - **Type Validation**: Support for various media types with automatic validation
 * - **Size Limits**: Automatic handling of file size and dimension restrictions
 * - **Error Handling**: Comprehensive error reporting for upload failures
 * - **Temporary Resources**: Create temporary chat resources for media sharing
 * 
 * ## Supported Media Types:
 * - Images (JPEG, PNG, GIF, WebP)
 * - Videos (MP4, WebM, etc.)
 * - Game assets and screenshots
 * - Avatar and profile images
 * - Chat attachments
 * 
 * ## Upload Process:
 * 1. File validation (size, type, dimensions)
 * 2. Multipart form upload to Game Jolt servers
 * 3. Media processing and optimization
 * 4. Return of media item with URLs and metadata
 * 
 * @example
 * ```typescript
 * import { createReadStream } from 'fs';
 * 
 * // Upload an image file
 * try {
 *   const fileStream = createReadStream('screenshot.png');
 *   const mediaItem = await client.api.media.uploadMedia(
 *     fileStream,
 *     12345, // parent resource ID
 *     'game-screenshot'
 *   );
 *   
 *   console.log(`Media uploaded: ${mediaItem.url}`);
 *   console.log(`Thumbnail: ${mediaItem.thumbnail_url}`);
 * } catch (error) {
 *   if (error.message.includes('File size must be less than')) {
 *     console.error('File too large:', error.message);
 *   } else {
 *     console.error('Upload failed:', error);
 *   }
 * }
 * 
 * // Create temporary chat resource
 * const tempResource = await client.api.media.chatTempResource(roomId);
 * console.log(`Temp resource ID: ${tempResource.payload.id}`);
 * ```
 */
export class MediaManager extends APIRequestManager {
  /**
   * Uploads a media file to the Game Jolt platform.
   * 
   * Handles the complete upload process including file validation, multipart upload,
   * and media processing. Returns a MediaItem object with URLs and metadata.
   * 
   * @param file - A readable stream of the file to upload.
   * @param parentId - The identifier of the parent resource (game, post, etc.) to associate with this media.
   * @param type - The type/category of media being uploaded (e.g., 'game-screenshot', 'avatar', 'chat-image').
   * @returns A Promise that resolves to a MediaItem object containing URLs and metadata.
   * @throws {Error} When upload fails due to file size, dimensions, format, or server errors.
   * 
   * @example
   * ```typescript
   * import { createReadStream } from 'fs';
   * import { pipeline } from 'stream/promises';
   * 
   * // Upload a game screenshot
   * try {
   *   const fileStream = createReadStream('epic-moment.png');
   *   const screenshot = await mediaManager.uploadMedia(
   *     fileStream,
   *     gameId,
   *     'game-screenshot'
   *   );
   *   
   *   console.log('Screenshot uploaded successfully!');
   *   console.log(`Full size: ${screenshot.url}`);
   *   console.log(`Thumbnail: ${screenshot.thumbnail_url}`);
   *   console.log(`Dimensions: ${screenshot.width}x${screenshot.height}`);
   *   
   * } catch (error) {
   *   if (error.message.includes('File size must be less than')) {
   *     // Handle size limit error
   *     const match = error.message.match(/(\d+) bytes/);
   *     const maxSize = match ? parseInt(match[1]) : 'unknown';
   *     console.error(`File too large. Maximum size: ${maxSize} bytes`);
   *     
   *   } else if (error.message.includes('dimensions less than')) {
   *     // Handle dimension limit error
   *     console.error('Image dimensions too large:', error.message);
   *     
   *   } else {
   *     console.error('Upload failed:', error);
   *   }
   * }
   * 
   * // Upload user avatar
   * const avatarStream = createReadStream('new-avatar.jpg');
   * const avatar = await mediaManager.uploadMedia(
   *   avatarStream,
   *   userId,
   *   'user-avatar'
   * );
   * ```
   * 
   * @remarks
   * - File size limits vary by media type and user account level
   * - Image dimensions are automatically validated against platform limits
   * - Supported formats depend on the media type specified
   * - Files are automatically optimized and thumbnails generated where appropriate
   * - Upload progress is not currently supported in this API
   */
  async uploadMedia(
    file: Readable,
    parentId: number,
    type: string,
  ): Promise<MediaItem> {
    const url = Endpoints.media.upload;
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
      const mediaItemsResult = await this.axios.post(Endpoints.media.items, {
        type,
        parent_id: parentId,
      });
      const sizePayload = mediaItemsResult.data.payload;
      const maxWidth = sizePayload.maxWidth;
      const maxHeight = sizePayload.maxHeight;
      const maxFilesize = sizePayload.maxFilesize;

      throw new Error(
        `File size must be less than ${maxFilesize} bytes and dimensions less than ${maxWidth}×${maxHeight} pixels.`,
      );
    }

    throw new Error(
      `General failure while uploading file. Status: ${result.status} ${result.statusText}`,
    );
  }

  /**
   * Creates a temporary chat resource for media sharing.
   * 
   * Generates a temporary resource identifier that can be used for uploading
   * media files in chat contexts. This is typically used for chat attachments
   * and temporary media sharing.
   * 
   * @param roomId - The identifier of the chat room to create the resource for.
   * @returns A Promise that resolves to API response data containing the temporary resource ID.
   * @throws {Error} When the API request fails or the room is invalid.
   * 
   * @example
   * ```typescript
   * // Create temp resource for chat media
   * try {
   *   const tempResource = await mediaManager.chatTempResource(chatRoomId);
   *   const tempResourceId = tempResource.payload.id;
   *   
   *   console.log(`Created temp resource: ${tempResourceId}`);
   *   
   *   // Use the temp resource for uploading chat media
   *   // The resource will be automatically cleaned up after use
   *   
   * } catch (error) {
   *   console.error('Failed to create temp resource:', error);
   * }
   * ```
   * 
   * @remarks
   * - Temporary resources have a limited lifespan and are automatically cleaned up
   * - Used primarily for chat attachments and ephemeral media sharing
   * - The room must exist and the user must have access to it
   */
  async chatTempResource(roomId: number): Promise<ApiData<{ id: number }>> {
    return await this.post<ApiData<{ id: number }>>(
      Endpoints.content.tempResource("chat-message"),
      {
        roomId,
      },
    );
  }
}
