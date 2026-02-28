"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { MethodBadge } from "./MethodBadge";
import type { NavSection } from "@/lib/navigation";

function SidebarSection({
  section,
  depth = 0,
}: {
  section: NavSection;
  depth?: number;
}) {
  const pathname = usePathname();
  const hasChildren = section.children && section.children.length > 0;

  // Check if any child is active
  const isChildActive = hasChildren
    ? section.children!.some(
        (child) =>
          child.href === pathname ||
          (child.children &&
            child.children.some((c) => c.href === pathname))
      )
    : false;

  const [isOpen, setIsOpen] = useState(isChildActive || depth === 0);

  if (section.href && !hasChildren) {
    const isActive = pathname === section.href;
    return (
      <Link
        href={section.href}
        className={clsx(
          "flex items-center gap-2 py-1.5 text-[13px] rounded-md transition-colors",
          depth > 0 ? "pl-3" : "pl-2",
          isActive
            ? "text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50"
        )}
      >
        {section.method && <MethodBadge method={section.method} />}
        <span className="truncate">{section.label}</span>
      </Link>
    );
  }

  return (
    <div className={depth > 0 ? "ml-2" : ""}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex items-center w-full text-left py-1.5 text-[13px] rounded-md transition-colors",
          depth === 0
            ? "font-semibold text-gray-900 dark:text-gray-100 pl-2"
            : "font-medium text-gray-700 dark:text-gray-300 pl-2 hover:bg-gray-50 dark:hover:bg-gray-800/50"
        )}
      >
        <svg
          className={clsx(
            "w-3 h-3 mr-1.5 transition-transform flex-shrink-0",
            isOpen && "rotate-90"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="truncate">{section.label}</span>
      </button>
      {isOpen && hasChildren && (
        <div className={clsx("mt-0.5 space-y-0.5", depth === 0 && "ml-2 border-l border-gray-200 dark:border-gray-700 pl-2")}>
          {section.children!.map((child, i) => (
            <SidebarSection key={child.href || i} section={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ sections }: { sections: NavSection[] }) {
  return (
    <nav className="space-y-4 py-4 px-3">
      <Link
        href="/"
        className="flex items-center gap-2 px-2 mb-4"
      >
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          Storno.ro
        </span>
        <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
          API
        </span>
      </Link>
      {sections.map((section, i) => (
        <SidebarSection key={i} section={section} />
      ))}
    </nav>
  );
}

export function MobileSidebar({ sections }: { sections: NavSection[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 text-gray-600 dark:text-gray-400"
        aria-label="Open menu"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-900 z-50 overflow-y-auto lg:hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <span className="font-bold text-gray-900 dark:text-white">Navigation</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Sidebar sections={sections} />
          </div>
        </>
      )}
    </>
  );
}
