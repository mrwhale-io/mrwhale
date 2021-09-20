export declare class MediaItem {
    id: number;
    type: string;
    parent_id: number;
    hash: string;
    filename: string;
    filetype: string;
    is_animated: boolean;
    width: number;
    height: number;
    filesize: number;
    crop_start_x: number;
    crop_start_y: number;
    crop_end_x: number;
    crop_end_y: number;
    added_on: number;
    status: string;
    img_url: string;
    mediaserver_url_webm: string;
    mediaserver_url_mp4: string;
    mediaserver_url: string;
    avg_img_color: null | string;
    img_has_transparency: boolean;
    post_id?: number;
    constructor(data: Partial<MediaItem>);
}
