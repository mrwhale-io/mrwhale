import { NodeSpec } from "prosemirror-model";

export const bulletList = {
  group: "block",
  content: "listItem+",
  toDOM: () => ["ul", 0],
  parseDOM: [{ tag: "ul" }],
} as NodeSpec;
