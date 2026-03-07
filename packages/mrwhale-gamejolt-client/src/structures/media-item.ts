/**
 * Represents a media item with various properties such as dimensions, file type, and URLs.
 */
export class MediaItem {
  /**
   * The unique identifier for the media item.
   */
  readonly id: number;

  /**
   * The type of the media item.
   */
  readonly type!: string;

  /**
   * The identifier of the parent item.
   */
  readonly parent_id!: number;

  /**
   * The hash of the media item.
   */
  readonly hash!: string;

  /**
   * The filename of the media item.
   */
  readonly filename!: string;

  /**
   * The file type of the media item.
   */
  readonly filetype!: string;

  /**
   * Indicates if the media item is animated.
   */
  readonly is_animated!: boolean;

  /**
   * The width of the media item.
   */
  readonly width!: number;

  /**
   * The height of the media item.
   */
  readonly height!: number;

  /**
   * The file size of the media item.
   */
  readonly filesize!: number;

  /**
   * The starting x-coordinate for cropping the media item.
   */
  readonly crop_start_x!: number;

  /**
   * The starting y-coordinate for cropping the media item.
   */
  readonly crop_start_y!: number;

  /**
   * The ending x-coordinate for cropping the media item.
   */
  readonly crop_end_x!: number;

  /**
   * The ending y-coordinate for cropping the media item.
   */
  readonly crop_end_y!: number;

  /**
   * The timestamp when the media item was added.
   */
  readonly added_on!: number;

  /**
   * The status of the media item.
   */
  readonly status!: string;

  /**
   * The URL of the image.
   */
  readonly img_url!: string;

  /**
   * The URL of the WebM version of the media item on the media server.
   */
  readonly mediaserver_url_webm!: string;

  /**
   * The URL of the MP4 version of the media item on the media server.
   */
  readonly mediaserver_url_mp4!: string;

  /**
   * The URL of the media item on the media server.
   */
  readonly mediaserver_url!: string;

  /**
   * The average color of the image.
   */
  readonly avg_img_color!: null | string;

  /**
   * Indicates if the image has transparency.
   */
  readonly img_has_transparency!: boolean;

  /**
   * The identifier of the associated post, if any.
   */
  readonly post_id?: number;

  /**
   * @param data Partial data to initialize the media item.
   */
  constructor(data: Partial<MediaItem>) {
    Object.assign(this, data);
  }
}
