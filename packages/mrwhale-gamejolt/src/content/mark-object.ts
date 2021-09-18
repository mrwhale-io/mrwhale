export type MarkObjectType =
  | "strong"
  | "em"
  | "code"
  | "link"
  | "strike"
  | "mention"
  | "tag";

export class MarkObject {
  type!: MarkObjectType;
  attrs!: { [key: string]: any };

  constructor(type: MarkObjectType) {
    this.type = type;
    this.attrs = {};
  }

  static fromJsonObj(
    jsonObj: Partial<{ type: MarkObjectType; attrs: any }>
  ): MarkObject {
    const obj = new MarkObject(jsonObj.type);

    if (jsonObj.attrs === undefined) {
      obj.attrs = {};
    } else {
      obj.attrs = jsonObj.attrs;
    }

    return obj;
  }

  toJsonObj(): Record<string, unknown> {
    const jsonObj = {} as any;

    jsonObj.type = this.type;

    if (Object.keys(this.attrs).length > 0) {
      jsonObj.attrs = this.attrs;
    }

    return jsonObj;
  }
}
