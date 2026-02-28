import { type Schema } from "@markdoc/markdoc";

export const tabs: Schema = {
  render: "Tabs",
  children: ["tab"],
  attributes: {},
};

export const tab: Schema = {
  render: "Tab",
  attributes: {
    label: { type: String, required: true },
  },
};
