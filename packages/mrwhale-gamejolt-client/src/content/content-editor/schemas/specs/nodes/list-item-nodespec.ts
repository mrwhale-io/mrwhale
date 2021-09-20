import { NodeSpec } from "prosemirror-model";

export const listItem = {
  content: "block*",
  toDOM: () => ["li", 0],
  parseDOM: [{ tag: "li" }],
  defining: true,
} as NodeSpec;
