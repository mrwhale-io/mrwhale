import { UserTheme } from "./user-theme";

export class User {
  id!: number;
  room_id!: number;
  last_message_on!: number;
  username!: string;
  display_name!: string;
  img_avatar!: string;
  permission_level!: number;
  url!: string;
  type!: string;
  name!: string;
  web_site!: string;
  slug!: string;
  dogtag!: string;
  status!: number;
  created_on!: Date;
  follower_count!: number;
  following_count!: number;
  comment_count!: number;
  theme?: UserTheme;

  constructor(data: Partial<User> = {}) {
    Object.assign(this, data);

    if (
      typeof this.created_on === "number" ||
      typeof this.created_on === "string"
    ) {
      this.created_on = new Date(this.created_on);
    }

    if (data.theme) {
      this.theme = new UserTheme(data.theme);
    }
  }
}
