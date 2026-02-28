import Markdoc, { type Schema } from "@markdoc/markdoc";

export const fence: Schema = {
  render: "CodeBlock",
  attributes: {
    content: { type: String },
    language: { type: String },
    title: { type: String },
  },
  transform(node) {
    const content = node.attributes.content || "";
    const language = node.attributes.language || "";
    const title = node.attributes.title || undefined;

    return new Markdoc.Tag("CodeBlock", { content, language, title }, []);
  },
};
