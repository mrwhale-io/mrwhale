import {
  ContentEditorSchema,
  generateSchema,
} from "./content-editor/schemas/content-editor-schema";
import { Selection, EditorState } from "prosemirror-state";
import { ContentEditor } from "./content-editor/content-editor";
import { Node, Mark } from "prosemirror-model";
import { ContextCapabilities, ContentContext } from "./content-context";
import { uuidv4 } from "../util/uuidv4";
import { MediaItem } from "../structures/media-item";
import { contentMarkdownParser } from "./content-markdown-parser";
import UpdateAutolinkPlugin from "./content-editor/plugins/update-autolinks-plugin";
import { ContentDocument } from "./content-document";
import { ContentObject } from "./content-object";
import { ContentWriter } from "./content-writer";

type ProsemirrorEditorFormat = {
  type: "doc";
  content: ContentObject[];
};

/**
 * Builds content editor content.
 */
export class Content {
  state: EditorState<ContentEditorSchema>;
  schema: ContentEditorSchema;
  capabilities: ContextCapabilities;

  constructor(public context: ContentContext = "chat-message", content = "") {
    this.capabilities = ContextCapabilities.getForContext(context);
    this.schema = generateSchema(this.capabilities);
    this.state = EditorState.create({
      doc: contentMarkdownParser(this.schema).parse(content),
      plugins: [new UpdateAutolinkPlugin(this.schema, this.capabilities)],
    }) as EditorState<ContentEditorSchema>;
  }

  /**
   * Create a text node in the schema. Empty text nodes are not allowed.
   * @param content The text content.
   * @param [marks] Any marks to add.
   */
  textNode(
    content: string,
    marks?: Mark<ContentEditorSchema>[]
  ): Node<ContentEditorSchema> {
    return this.state.schema.text(content, marks);
  }

  /**
   * Create an auto link mark.
   * @param href The address of the link.
   * @param title The title of the link.
   */
  autoLink(href: string, title: string): Mark<ContentEditorSchema> {
    return this.state.schema.mark("link", {
      href,
      title,
      autolink: true,
    });
  }

  /**
   * Create a user mention mark.
   * @param username The username of the user to mention.
   */
  mention(username: string): Mark<ContentEditorSchema> {
    return this.state.schema.mark("mention", { username });
  }

  /**
   * Create a code mark.
   * @param text The text content of the code.
   */
  code(text: string): Mark<ContentEditorSchema> {
    return this.state.schema.mark("code", { text });
  }

  /**
   * Insert a paragraph node.
   * @param [content] The nodes to contain within paragraph node.
   */
  paragraphNode(
    content?: Node<ContentEditorSchema> | Node<ContentEditorSchema>[]
  ): Node<ContentEditorSchema> {
    return this.state.schema.nodes.paragraph.create({}, content);
  }

  /**
   * Insert a list item node.
   * @param [content] The nodes to contain within list item node.
   */
  listItemNode(
    content?: Node<ContentEditorSchema> | Node<ContentEditorSchema>[]
  ): Node<ContentEditorSchema> {
    return this.state.schema.nodes.listItem.create({}, content);
  }

  /**
   * Insert a text node.
   * @param content The content of the text node.
   * @param [marks] Any marks to include.
   */
  insertText(content: string, marks?: Mark<ContentEditorSchema>[]): this {
    const node = this.schema.text(content, marks);
    this.insertNewNode(node);

    return this;
  }

  /**
   * Insert a media upload node.
   * @param mediaItem The media item to insert.
   */
  insertImage(mediaItem: MediaItem): this {
    const uploadId = uuidv4();
    const newNode = this.schema.nodes.mediaUpload.create({
      uploadId,
    });

    this.insertNewNode(newNode);

    const tr = this.state.tr;
    const nodePos = this.findTargetNodePos(uploadId);
    tr.setNodeMarkup(nodePos, this.state.schema.nodes.mediaItem, {
      id: mediaItem.id,
      width: mediaItem.width,
      height: mediaItem.height,
      align: "center",
      caption: "",
    });
    this.state = this.state.apply(tr);

    return this;
  }

  /**
   * Insert a code block node.
   * @param [content] The nodes to contain within code block node.
   */
  insertCodeBlock(
    content: string | Node<ContentEditorSchema> | Node<ContentEditorSchema>[]
  ): this {
    let contentNode: Node<ContentEditorSchema> | Node<ContentEditorSchema>[];
    if (typeof content === "string") {
      contentNode = this.textNode(content);
    } else {
      contentNode = content;
    }

    const node = this.schema.nodes.codeBlock.create({}, contentNode);
    this.insertNewNode(node);

    return this;
  }

  /**
   * Insert a bullet list node.
   * @param items The nodes to contain within bullet list node.
   */
  insertBulletList(items: Node<ContentEditorSchema>[]): this {
    const listNode = this.state.schema.nodes.bulletList.create({}, items);
    this.insertNewNode(listNode);

    return this;
  }

  /**
   * Insert a ordered list node.
   * @param items The nodes to contain within ordered list node.
   */
  insertOrderedList(items: Node<ContentEditorSchema>[]): this {
    const listNode = this.state.schema.nodes.orderedList.create({}, items);
    this.insertNewNode(listNode);

    return this;
  }

  /**
   * Convert the document to JSON.
   */
  contentJson(): string {
    const inObj = this.state.doc.toJSON() as ProsemirrorEditorFormat;
    const outDoc = new ContentDocument(
      this.context,
      inObj.content.map((i) => ContentObject.fromJsonObj(i))
    );

    // Make sure we always have at least one paragraph node
    if (!outDoc.hasChildren) {
      const writer = new ContentWriter(outDoc);
      writer.ensureParagraph();
    }

    return outDoc.toJson();
  }

  /**
   * Replaces the empty paragraph with the new node.
   * @param newNodes The nodes to insert.
   */
  insertNewNode(newNodes: Node | Node[]): void {
    const tr = this.state.tr;
    tr.replaceWith(
      this.state.selection.from - 1,
      this.state.selection.to + 1,
      newNodes
    );

    const resolvedCursorPos = tr.doc.resolve(this.state.selection.from);
    const selection = Selection.near(resolvedCursorPos);
    tr.setSelection(selection);
    ContentEditor.ensureEndNode(tr, this.state.schema.nodes.paragraph);
    this.state = this.state.apply(tr);
  }

  private findTargetNodePos(uploadId: string) {
    // Loops through nodes trying to find the mediaUpload node with a matching uploadId
    for (let i = 0; i < this.state.doc.nodeSize; i++) {
      const node = this.state.doc.nodeAt(i);
      if (
        node !== null &&
        node !== undefined &&
        node.type.name === "mediaUpload" &&
        node.attrs.uploadId === uploadId
      ) {
        return i;
      }
    }
    return -1;
  }
}
