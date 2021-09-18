import { NodeSpec } from "prosemirror-model";

export const spoiler = {
  group: "block",
  content: "block*",
  defining: true,
  toDOM: () => [
    "blockquote",
    {
      spoiler: "true",
      class: "content-editor-spoiler",
    },
    0,
  ],
  parseDOM: [{ tag: "blockquote[spoiler]" }],
} as NodeSpec;
