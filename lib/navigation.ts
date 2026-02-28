import { getAllFileInfo, type FileInfo } from "./content";

export interface NavSection {
  label: string;
  href?: string;
  method?: string;
  children?: NavSection[];
}

const SECTION_ORDER = [
  "getting-started",
  "concepts",
  "integrations",
  "objects",
  "api-reference",
  "contributing-guide",
];

const SECTION_LABELS: Record<string, string> = {
  "getting-started": "Getting Started",
  concepts: "Concepts",
  integrations: "Integrations",
  objects: "Objects",
  "api-reference": "API Reference",
  "contributing-guide": "Contributing Guide",
};

const GROUPED_SECTIONS = ["api-reference", "contributing-guide"];

function slugToHref(slug: string[]): string {
  if (slug.length === 0) return "/";
  return "/" + slug.join("/");
}

function titleCase(str: string): string {
  return str
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function buildNavigation(): NavSection[] {
  const files = getAllFileInfo();
  const nav: NavSection[] = [];

  // Group files by top-level section
  const sections = new Map<string, FileInfo[]>();
  const topLevel: FileInfo[] = [];

  for (const file of files) {
    if (file.slug.length === 0) continue; // skip index
    const section = file.slug[0];
    if (SECTION_ORDER.includes(section)) {
      if (!sections.has(section)) sections.set(section, []);
      sections.get(section)!.push(file);
    } else {
      topLevel.push(file);
    }
  }

  // Build each section
  for (const sectionKey of SECTION_ORDER) {
    const sectionFiles = sections.get(sectionKey) || [];
    if (sectionFiles.length === 0) continue;

    const section: NavSection = {
      label: SECTION_LABELS[sectionKey] || titleCase(sectionKey),
      children: [],
    };

    if (GROUPED_SECTIONS.includes(sectionKey)) {
      // Group by subdirectory
      const subgroups = new Map<string, FileInfo[]>();
      const directFiles: FileInfo[] = [];

      for (const file of sectionFiles) {
        if (file.slug.length > 2) {
          const subgroup = file.slug[1];
          if (!subgroups.has(subgroup)) subgroups.set(subgroup, []);
          subgroups.get(subgroup)!.push(file);
        } else {
          directFiles.push(file);
        }
      }

      // Add direct files first
      for (const file of directFiles) {
        section.children!.push({
          label: file.title,
          href: slugToHref(file.slug),
          method: file.method,
        });
      }

      // Add subgroups sorted alphabetically
      const sortedGroups = [...subgroups.keys()].sort();
      for (const groupKey of sortedGroups) {
        const groupFiles = subgroups.get(groupKey)!;
        const group: NavSection = {
          label: titleCase(groupKey),
          children: groupFiles
            .sort((a, b) => a.title.localeCompare(b.title))
            .map((f) => ({
              label: f.title,
              href: slugToHref(f.slug),
              method: f.method,
            })),
        };
        section.children!.push(group);
      }
    } else {
      // Simple section - flat list
      section.children = sectionFiles
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((f) => ({
          label: f.title,
          href: slugToHref(f.slug),
          method: f.method,
        }));
    }

    nav.push(section);
  }

  // Add top-level pages (changelog, etc.)
  for (const file of topLevel) {
    nav.push({
      label: file.title,
      href: slugToHref(file.slug),
    });
  }

  return nav;
}
