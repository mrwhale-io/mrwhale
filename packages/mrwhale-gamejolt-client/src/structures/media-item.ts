/**
 * Represents a media item with various properties such as dimensions, file type, and URLs.
 */
export class MediaItem {
  /**
   * The unique identifier for the media item.
   */
  id: number;

  /**
   * The type of the media item.
   */
  type!: string;

  /**
   * The identifier of the parent item.
   */
  parent_id!: number;

  /**
   * The hash of the media item.
   */
  hash!: string;

  /**
   * The filename of the media item.
   */
  filename!: string;

  /**
   * The file type of the media item.
   */
  filetype!: string;

  /**
   * Indicates if the media item is animated.
   */
  is_animated!: boolean;

  /**
   * The width of the media item.
   */
  width!: number;

  /**
   * The height of the media item.
   */
  height!: number;

  /**
   * The file size of the media item.
   */
  filesize!: number;

  /**
   * The starting x-coordinate for cropping the media item.
   */
  crop_start_x!: number;

  /**
   * The starting y-coordinate for cropping the media item.
   */
  crop_start_y!: number;

  /**
   * The ending x-coordinate for cropping the media item.
   */
  crop_end_x!: number;

  /**
   * The ending y-coordinate for cropping the media item.
   */
  crop_end_y!: number;

  /**
   * The timestamp when the media item was added.
   */
  added_on!: number;

  /**
   * The status of the media item.
   */
  status!: string;

  /**
   * The URL of the image.
   */
  img_url!: string;

  /**
   * The URL of the WebM version of the media item on the media server.
   */
  mediaserver_url_webm!: string;

  /**
   * The URL of the MP4 version of the media item on the media server.
   */
  mediaserver_url_mp4!: string;

  /**
   * The URL of the media item on the media server.
   */
  mediaserver_url!: string;

  /**
   * The average color of the image.
   */
  avg_img_color!: null | string;

  /**
   * Indicates if the image has transparency.
   */
  img_has_transparency!: boolean;

  /**
   * The identifier of the associated post, if any.
   */
  post_id?: number;

  /**
   * @param data Partial data to initialize the media item.
   */
  constructor(data: Partial<MediaItem>) {
    Object.assign(this, data);
  }
}
