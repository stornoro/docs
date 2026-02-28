"use client";

import React from "react";
import Markdoc, { type RenderableTreeNode } from "@markdoc/markdoc";
import { Tabs, Tab } from "./Tabs";
import { Callout } from "./Callout";
import { CodeBlock } from "./CodeBlock";

const components = {
  Tabs,
  Tab,
  Callout,
  CodeBlock,
};

export function MarkdocRenderer({ content }: { content: RenderableTreeNode }) {
  return (
    <>{Markdoc.renderers.react(content, React, { components })}</>
  );
}
