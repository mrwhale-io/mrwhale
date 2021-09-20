import { NodeSpec } from "prosemirror-model";

export const codeBlock = {
  group: "block",
  marks: "",
  code: true,
  content: "(text | hardBreak)*",
  toDOM: () => ["pre", 0],
  parseDOM: [{ tag: "pre" }],
} as NodeSpec;
