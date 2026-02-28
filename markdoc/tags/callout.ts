import { type Schema } from "@markdoc/markdoc";

export const callout: Schema = {
  render: "Callout",
  children: ["paragraph", "tag", "list"],
  attributes: {
    type: {
      type: String,
      default: "note",
      matches: ["note", "warning", "info"],
    },
  },
};
