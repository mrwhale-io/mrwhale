import * as markdownit from "markdown-it/lib";
import { MarkdownParser } from "prosemirror-markdown";

import { ContentEditorSchema } from "./content-editor/schemas/content-editor-schema";

function listIsTight(tokens, index) {
  while (++index < tokens.length)
    if (tokens[index].type != "list_item_open") {
      return tokens[index].hidden;
    }

  return false;
}

/**
 * Create a content editor markdown parser.
 * @param schema The content editor schema.
 */
export const contentMarkdownParser = (
  schema: ContentEditorSchema
): MarkdownParser<ContentEditorSchema> =>
  new MarkdownParser(schema, markdownit("commonmark", { html: false }), {
    blockquote: { block: "blockquote" },
    paragraph: { block: "paragraph" },
    list_item: { block: "listItem" },
    bullet_list: {
      block: "bulletList",
      getAttrs: (_, tokens, index) => ({ tight: listIsTight(tokens, index) }),
    } as unknown,
    ordered_list: {
      block: "orderedList",
      getAttrs: (token, tokens, index) => ({
        order: +token.attrGet("start") || 1,
        tight: listIsTight(tokens, index),
      }),
    } as unknown,
    code_block: { block: "codeBlock", noCloseToken: false },
    fence: {
      block: "codeBlock",
      getAttrs: (token) => ({ params: token.info || "" }),
      noCloseToken: false,
    },
    hardbreak: { node: "hardBreak" },

    em: { mark: "em" },
    strong: { mark: "strong" },
    link: {
      mark: "link",
      getAttrs: (token) => ({
        href: token.attrGet("href"),
        title: token.attrGet("title") || null,
        autolink: true,
      }),
    },
    code_inline: { mark: "code", noCloseToken: true },
  });
