import { Mark, MarkSpec } from "prosemirror-model";

export const mention = {
  attrs: {
    username: {},
  },
  inclusive: false,
  toDOM(mark: Mark) {
    const { username } = mark.attrs;
    return [
      "span",
      {
        class: "content-editor-mention",
        "data-username": username,
      },
      0,
    ];
  },
  parseDOM: [
    {
      tag: "span[data-username]",
      getAttrs(domNode: Element) {
        return {
          username: domNode.getAttribute("data-username"),
        };
      },
    },
  ],
} as MarkSpec;
