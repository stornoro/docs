/**
 * Generates llms.txt and llms-full.txt from the docs markdown files.
 *
 * llms.txt  — lightweight index with links and one-line descriptions
 * llms-full.txt — full content of every documentation page
 *
 * Run: node scripts/generate-llms.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.resolve(__dirname, "..", "content");
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");
const BASE_URL = "https://docs.storno.ro";

const SECTION_ORDER = [
  "getting-started",
  "concepts",
  "integrations",
  "objects",
  "api-reference",
  "contributing-guide",
];

const SECTION_LABELS = {
  "getting-started": "Getting Started",
  concepts: "Concepts",
  integrations: "Integrations",
  objects: "Objects",
  "api-reference": "API Reference",
  "contributing-guide": "Contributing Guide",
};

const GROUPED_SECTIONS = ["api-reference", "contributing-guide"];

function titleCase(str) {
  return str
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Parse frontmatter from a markdown file (minimal parser, avoids gray-matter ESM issues).
 */
function parseFrontmatter(raw) {
  if (!raw.startsWith("---")) return { data: {}, content: raw };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { data: {}, content: raw };

  const yaml = raw.slice(4, end);
  const data = {};
  for (const line of yaml.split("\n")) {
    const match = line.match(/^(\w[\w-]*):\s*(.+)$/);
    if (match) {
      data[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
    }
  }
  return { data, content: raw.slice(end + 4).trim() };
}

/**
 * Recursively collect all .md files (excluding llms.txt and other non-doc files).
 */
function walkDocs(dir, base = []) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDocs(fullPath, [...base, entry.name]));
    } else if (entry.name.endsWith(".md")) {
      const name = entry.name.replace(/\.md$/, "");
      const slug =
        entry.name === "index.md"
          ? base.length > 0
            ? [...base]
            : []
          : [...base, name];

      const raw = fs.readFileSync(fullPath, "utf-8");
      const { data, content } = parseFrontmatter(raw);

      results.push({
        slug,
        title: data.title || titleCase(name),
        description: data.description || "",
        method: data.method || "",
        endpoint: data.endpoint || "",
        content,
        filePath: fullPath,
      });
    }
  }

  return results;
}

/**
 * Strip Markdoc-specific tags like {% callout %}, {% code-snippet %} etc.
 */
function stripMarkdocTags(content) {
  return content
    .replace(/\{%\s*\/?\w[\w-]*(?:\s+[^%]*)?\s*%\}/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Group files by section, matching the navigation structure.
 */
function groupBySection(files) {
  const sections = new Map();
  const topLevel = [];

  for (const file of files) {
    if (file.slug.length === 0) continue; // skip index
    const section = file.slug[0];
    if (SECTION_ORDER.includes(section)) {
      if (!sections.has(section)) sections.set(section, []);
      sections.get(section).push(file);
    } else {
      topLevel.push(file);
    }
  }

  return { sections, topLevel };
}

function slugToUrl(slug) {
  if (slug.length === 0) return BASE_URL;
  return `${BASE_URL}/${slug.join("/")}`;
}

// ── Generate llms.txt ──────────────────────────────────────────────

function generateIndex(files) {
  const { sections, topLevel } = groupBySection(files);
  const lines = [];

  lines.push("# Storno.ro API Documentation");
  lines.push("");
  lines.push(
    "> Storno.ro is an e-invoicing platform that integrates with e-invoice provider systems across the EU (Romania, Germany, Italy, Poland, France). The API allows you to manage companies, create and send invoices, track payments, and automate your invoicing workflow."
  );
  lines.push("");
  lines.push("Base URL: https://api.storno.ro");
  lines.push("Docs: https://docs.storno.ro");

  for (const sectionKey of SECTION_ORDER) {
    const sectionFiles = sections.get(sectionKey) || [];
    if (sectionFiles.length === 0) continue;

    if (GROUPED_SECTIONS.includes(sectionKey)) {
      // Group by subdirectory
      const sectionLabel = SECTION_LABELS[sectionKey] || titleCase(sectionKey);
      const subgroups = new Map();
      for (const file of sectionFiles) {
        const group = file.slug.length > 2 ? file.slug[1] : "_direct";
        if (!subgroups.has(group)) subgroups.set(group, []);
        subgroups.get(group).push(file);
      }

      const sortedGroups = [...subgroups.keys()].sort();
      for (const groupKey of sortedGroups) {
        const groupFiles = subgroups.get(groupKey);
        const label =
          groupKey === "_direct"
            ? sectionLabel
            : `${sectionLabel} — ${titleCase(groupKey)}`;
        lines.push("");
        lines.push(`## ${label}`);
        lines.push("");
        for (const file of groupFiles.sort((a, b) =>
          a.title.localeCompare(b.title)
        )) {
          lines.push(
            `- [${file.title}](${slugToUrl(file.slug)}): ${file.description}`
          );
        }
      }
    } else {
      const label = SECTION_LABELS[sectionKey] || titleCase(sectionKey);
      lines.push("");
      lines.push(`## ${label}`);
      lines.push("");
      for (const file of sectionFiles.sort((a, b) =>
        a.title.localeCompare(b.title)
      )) {
        lines.push(
          `- [${file.title}](${slugToUrl(file.slug)}): ${file.description}`
        );
      }
    }
  }

  // Top-level pages (changelog, faq, etc.)
  if (topLevel.length > 0) {
    lines.push("");
    lines.push("## Other");
    lines.push("");
    for (const file of topLevel.sort((a, b) =>
      a.title.localeCompare(b.title)
    )) {
      lines.push(
        `- [${file.title}](${slugToUrl(file.slug)}): ${file.description}`
      );
    }
  }

  return lines.join("\n") + "\n";
}

// ── Generate llms-full.txt ─────────────────────────────────────────

function generateFull(files) {
  const { sections, topLevel } = groupBySection(files);
  const parts = [];

  parts.push("# Storno.ro API Documentation — Full Content");
  parts.push("");
  parts.push(
    "> This file contains the full content of all documentation pages for Storno.ro, an e-invoicing platform for EU businesses."
  );
  parts.push("");
  parts.push("Base URL: https://api.storno.ro");
  parts.push("Docs: https://docs.storno.ro");
  parts.push("");

  function addFile(file) {
    parts.push("---");
    parts.push("");
    parts.push(`## ${file.title}`);
    if (file.description) {
      parts.push("");
      parts.push(`> ${file.description}`);
    }
    parts.push("");
    parts.push(`URL: ${slugToUrl(file.slug)}`);
    parts.push("");
    parts.push(stripMarkdocTags(file.content));
    parts.push("");
  }

  for (const sectionKey of SECTION_ORDER) {
    const sectionFiles = sections.get(sectionKey) || [];
    if (sectionFiles.length === 0) continue;

    if (GROUPED_SECTIONS.includes(sectionKey)) {
      const subgroups = new Map();
      for (const file of sectionFiles) {
        const group = file.slug.length > 2 ? file.slug[1] : "_direct";
        if (!subgroups.has(group)) subgroups.set(group, []);
        subgroups.get(group).push(file);
      }
      const sortedGroups = [...subgroups.keys()].sort();
      for (const groupKey of sortedGroups) {
        const groupFiles = subgroups.get(groupKey);
        for (const file of groupFiles.sort((a, b) =>
          a.title.localeCompare(b.title)
        )) {
          addFile(file);
        }
      }
    } else {
      for (const file of sectionFiles.sort((a, b) =>
        a.title.localeCompare(b.title)
      )) {
        addFile(file);
      }
    }
  }

  for (const file of topLevel.sort((a, b) =>
    a.title.localeCompare(b.title)
  )) {
    addFile(file);
  }

  return parts.join("\n") + "\n";
}

// ── Main ───────────────────────────────────────────────────────────

const files = walkDocs(DOCS_DIR);

// Filter out non-doc files (llms.txt itself, etc.)
const docFiles = files.filter(
  (f) =>
    f.slug.length > 0 &&
    !f.filePath.endsWith("llms.txt")
);

const indexContent = generateIndex(docFiles);
const fullContent = generateFull(docFiles);

fs.mkdirSync(PUBLIC_DIR, { recursive: true });
fs.writeFileSync(path.join(PUBLIC_DIR, "llms.txt"), indexContent);
fs.writeFileSync(path.join(PUBLIC_DIR, "llms-full.txt"), fullContent);

console.log(
  `Generated llms.txt (${indexContent.length} bytes, ${docFiles.length} pages)`
);
console.log(`Generated llms-full.txt (${fullContent.length} bytes)`);
