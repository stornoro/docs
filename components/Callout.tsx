import React from "react";
import clsx from "clsx";

const styles: Record<string, { border: string; bg: string; icon: string; title: string }> = {
  note: {
    border: "border-gray-300 dark:border-gray-600",
    bg: "bg-gray-50 dark:bg-gray-800/50",
    icon: "💡",
    title: "Note",
  },
  warning: {
    border: "border-amber-400 dark:border-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    icon: "⚠️",
    title: "Warning",
  },
  info: {
    border: "border-blue-400 dark:border-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    icon: "ℹ️",
    title: "Info",
  },
};

export function Callout({
  type = "note",
  children,
}: {
  type?: "note" | "warning" | "info";
  children: React.ReactNode;
}) {
  const s = styles[type] || styles.note;

  return (
    <div
      className={clsx(
        "my-4 rounded-lg border-l-4 p-4",
        s.border,
        s.bg
      )}
    >
      <div className="flex items-start gap-2">
        <span className="text-lg leading-none mt-0.5">{s.icon}</span>
        <div className="prose-sm dark:prose-invert flex-1 [&>p]:my-1">
          {children}
        </div>
      </div>
    </div>
  );
}
