export class UserTheme {
  id!: number;
  highlight!: string;
  backlight!: string;
  notice!: string;
  tint?: string;
  theme_preset_id?: number;
  custom?: string;

  constructor(data: Partial<UserTheme> = {}) {
    Object.assign(this, data);
    this.highlight = this.highlight || "ccff00";
    this.backlight = this.backlight || "2f7f6f";
    this.notice = this.notice || "ff3fac";
    this.tint = this.tint || "4800ff"
  }
}
