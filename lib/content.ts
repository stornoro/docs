import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Markdoc, { type Node } from "@markdoc/markdoc";

const DOCS_DIR = path.join(process.cwd(), "content");

export interface DocFrontmatter {
  title: string;
  description: string;
  method?: string;
  endpoint?: string;
}

export interface Document {
  frontmatter: DocFrontmatter;
  content: Node;
  slug: string[];
}

function slugToFilePath(slug: string[]): string | null {
  if (!slug || slug.length === 0) {
    const indexPath = path.join(DOCS_DIR, "index.md");
    return fs.existsSync(indexPath) ? indexPath : null;
  }

  // Try direct file match first
  const directPath = path.join(DOCS_DIR, ...slug) + ".md";
  if (fs.existsSync(directPath)) return directPath;

  // Try as directory with index.md
  const indexPath = path.join(DOCS_DIR, ...slug, "index.md");
  if (fs.existsSync(indexPath)) return indexPath;

  return null;
}

export function getDocument(slug: string[]): Document | null {
  const filePath = slugToFilePath(slug);
  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const ast = Markdoc.parse(content);

  return {
    frontmatter: data as DocFrontmatter,
    content: ast,
    slug,
  };
}

function walkDir(dir: string, base: string = ""): string[][] {
  const slugs: string[][] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      slugs.push(...walkDir(path.join(dir, entry.name), path.join(base, entry.name)));
    } else if (entry.name.endsWith(".md")) {
      if (entry.name === "index.md") {
        // index.md maps to the directory itself
        if (base === "") {
          // Root index.md → home page (empty slug)
          continue;
        }
        slugs.push(base.split(path.sep));
      } else {
        const name = entry.name.replace(/\.md$/, "");
        const parts = base ? [...base.split(path.sep), name] : [name];
        slugs.push(parts);
      }
    }
  }

  return slugs;
}

export function getAllSlugs(): string[][] {
  return walkDir(DOCS_DIR);
}

export interface NavItem {
  label: string;
  href: string;
  method?: string;
  children?: NavItem[];
}

export interface FileInfo {
  slug: string[];
  title: string;
  method?: string;
  endpoint?: string;
}

export function getAllFileInfo(): FileInfo[] {
  const results: FileInfo[] = [];

  function walk(dir: string, base: string[] = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath, [...base, entry.name]);
      } else if (entry.name.endsWith(".md")) {
        const raw = fs.readFileSync(fullPath, "utf-8");
        const { data } = matter(raw);
        const name = entry.name.replace(/\.md$/, "");

        let slug: string[];
        if (entry.name === "index.md") {
          slug = base.length > 0 ? [...base] : [];
        } else {
          slug = [...base, name];
        }

        results.push({
          slug,
          title: (data as DocFrontmatter).title || name,
          method: (data as DocFrontmatter).method,
          endpoint: (data as DocFrontmatter).endpoint,
        });
      }
    }
  }

  walk(DOCS_DIR);
  return results;
}
