import { type Schema } from "@markdoc/markdoc";

export const codeSnippetGroup: Schema = {
  render: "Tabs",
  children: ["code-snippet"],
  attributes: {},
};

export const codeSnippet: Schema = {
  render: "Tab",
  attributes: {
    title: { type: String, required: true, render: "label" },
  },
};
