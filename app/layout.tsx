import type { Metadata } from "next";
import "./globals.css";
import { buildNavigation } from "@/lib/navigation";
import { getAllFileInfo } from "@/lib/content";
import { Sidebar, MobileSidebar } from "@/components/Sidebar";
import { SearchDialog, type SearchItem } from "@/components/SearchDialog";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: {
    template: "%s | Storno.ro API",
    default: "Storno.ro API Documentation",
  },
  description: "Complete API reference for the Storno.ro e-invoicing platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nav = buildNavigation();
  const files = getAllFileInfo();

  const searchItems: SearchItem[] = files.map((f) => ({
    title: f.title,
    href: f.slug.length === 0 ? "/" : "/" + f.slug.join("/"),
    description: f.endpoint,
    method: f.method,
  }));

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (stored === 'dark' || (!stored && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-2">
              <MobileSidebar sections={nav} />
              <a href="/" className="flex items-center gap-2">
                <img src="/logo.svg" alt="Storno.ro" className="h-7 w-7" />
                <span className="font-bold text-gray-900 dark:text-white">
                  Storno.ro
                </span>
                <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                  Docs
                </span>
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-xs font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">v1</span>
              <SearchDialog items={searchItems} />
              <ThemeToggle />
              <a
                href="https://app.storno.ro"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Open App
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto sidebar-scroll">
            <Sidebar sections={nav} />
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
