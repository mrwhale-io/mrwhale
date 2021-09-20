import { NodeSpec } from "prosemirror-model";

export const paragraph = {
  group: "block",
  content: "inline*",
  toDOM: () => ["p", 0],
  parseDOM: [{ tag: "p" }],
} as NodeSpec;
