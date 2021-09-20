import {  NodeSpec } from "prosemirror-model";

export const blockquote = {
  group: "block",
  content: "block*",
  defining: true,
  toDOM: () => ["blockquote", 0],
  parseDOM: [{ tag: "blockquote" }],
} as NodeSpec;
