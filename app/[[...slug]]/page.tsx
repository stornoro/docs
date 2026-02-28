import { notFound } from "next/navigation";
import { getDocument, getAllSlugs } from "@/lib/content";
import { transformContent } from "@/lib/render";
import { MarkdocRenderer } from "@/components/MarkdocRenderer";
import { TableOfContents } from "@/components/TableOfContents";
import { MethodBadge } from "@/components/MethodBadge";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return [
    { slug: undefined }, // homepage
    ...slugs.map((slug) => ({ slug })),
  ];
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const doc = getDocument(slug || []);
  if (!doc) return { title: "Not Found" };

  return {
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = getDocument(slug || []);

  if (!doc) {
    notFound();
  }

  const { tree, toc } = await transformContent(doc.content);

  return (
    <div className="flex">
      {/* Content */}
      <div className="flex-1 min-w-0 px-6 py-8 lg:px-12 max-w-4xl">
        {/* Endpoint bar */}
        {doc.frontmatter.method && doc.frontmatter.endpoint && (
          <div className="endpoint-bar mb-6">
            <MethodBadge method={doc.frontmatter.method} />
            <code className="text-gray-700 dark:text-gray-300">
              {doc.frontmatter.endpoint}
            </code>
          </div>
        )}

        {/* Prose content */}
        <article className="prose prose-gray dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-table:overflow-x-auto">
          <MarkdocRenderer content={tree} />
        </article>
      </div>

      {/* Right ToC */}
      {toc.length > 0 && (
        <aside className="hidden xl:block w-56 flex-shrink-0 py-8 pr-6 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          <TableOfContents entries={toc} />
        </aside>
      )}
    </div>
  );
}
