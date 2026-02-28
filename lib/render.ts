import Markdoc, { type RenderableTreeNode, type Node } from "@markdoc/markdoc";
import { highlight } from "./highlight";
import markdocConfig from "@/markdoc/config";
import type { TocEntry } from "@/components/TableOfContents";

/**
 * Transform a Markdoc AST into a renderable tree,
 * applying Shiki highlighting to all code blocks at build time.
 */
export async function transformContent(
  ast: Node
): Promise<{ tree: RenderableTreeNode; toc: TocEntry[] }> {
  const tree = Markdoc.transform(ast, markdocConfig);
  const toc: TocEntry[] = [];

  // Walk tree to highlight code blocks and collect headings
  await walkTree(tree, toc);

  // Serialize to plain objects (strips Markdoc Tag prototypes) so
  // the tree can be passed from Server Components to Client Components
  const serialized = JSON.parse(JSON.stringify(tree)) as RenderableTreeNode;

  return { tree: serialized, toc };
}

async function walkTree(
  node: RenderableTreeNode,
  toc: TocEntry[]
): Promise<void> {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") {
    return;
  }

  if (Array.isArray(node)) {
    for (const child of node) {
      await walkTree(child, toc);
    }
    return;
  }

  // Check if it's a Tag-like object
  const tag = node as { name?: string; attributes?: Record<string, unknown>; children?: RenderableTreeNode[] };

  if (!tag.name) return;

  // Handle code blocks — add highlighted HTML
  if (tag.name === "CodeBlock" && tag.attributes) {
    const content = (tag.attributes.content as string) || "";
    const language = (tag.attributes.language as string) || "";
    if (content) {
      const html = await highlight(content, language);
      tag.attributes.highlightedHtml = html;
    }
  }

  // Collect h2/h3 headings for ToC
  if ((tag.name === "h2" || tag.name === "h3") && tag.children) {
    const text = extractText(tag.children);
    const id = slugify(text);
    tag.attributes = { ...tag.attributes, id };
    toc.push({
      id,
      title: text,
      level: tag.name === "h2" ? 2 : 3,
    });
  }

  // Recurse into children
  if (tag.children) {
    for (const child of tag.children) {
      await walkTree(child, toc);
    }
  }
}

function extractText(children: RenderableTreeNode[]): string {
  return children
    .map((child) => {
      if (typeof child === "string") return child;
      if (typeof child === "number") return String(child);
      if (child && typeof child === "object" && !Array.isArray(child)) {
        const tag = child as { children?: RenderableTreeNode[] };
        if (tag.children) return extractText(tag.children);
      }
      return "";
    })
    .join("");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
