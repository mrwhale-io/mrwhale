import { NodeSpec } from "prosemirror-model";

export const orderedList = {
  group: "block",
  content: "listItem+",
  toDOM: () => ["ol", 0],
  parseDOM: [{ tag: "ol" }],
} as NodeSpec;
