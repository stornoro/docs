import type { Config } from "@markdoc/markdoc";
import { tabs, tab } from "./tags/tabs";
import { codeSnippetGroup, codeSnippet } from "./tags/code-snippet";
import { callout } from "./tags/callout";
import { fence } from "./nodes/fence";

const config: Config = {
  tags: {
    tabs,
    tab,
    "code-snippet-group": codeSnippetGroup,
    "code-snippet": codeSnippet,
    callout,
  },
  nodes: {
    fence,
  },
};

export default config;
