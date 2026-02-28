"use client";

import React, { useState } from "react";
import clsx from "clsx";

interface TabChild {
  props: {
    label: string;
    children: React.ReactNode;
  };
}

export function Tabs({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(0);

  const tabs = React.Children.toArray(children) as unknown as TabChild[];

  return (
    <div className="my-4 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        {tabs.map((tab, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={clsx(
              "px-4 py-2 text-sm font-medium transition-colors",
              active === i
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-gray-900"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            {tab.props?.label}
          </button>
        ))}
      </div>
      <div>
        {tabs.map((tab, i) => (
          <div key={i} className={active === i ? "block" : "hidden"}>
            {tab.props?.children}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Tab({
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
