"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Tabs({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: { id: string; label: string; tone?: "danger" | "link" }[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-1 overflow-x-auto border-b border-border",
        className,
      )}
      role="tablist"
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn(
            "shrink-0 px-3 py-2.5 text-sm font-medium transition border-b-2 -mb-px",
            value === t.id
              ? t.tone === "danger"
                ? "border-error text-error"
                : t.tone === "link"
                  ? "border-[#3b82f6] text-[#3b82f6]"
                  : "border-brand text-brand"
              : t.tone === "danger"
                ? "border-transparent text-error"
                : t.tone === "link"
                  ? "border-transparent text-[#3b82f6]"
                  : "border-transparent text-text-muted hover:text-text",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function TabPanel({
  when,
  active,
  children,
}: {
  when: string;
  active: string;
  children: ReactNode;
}) {
  if (when !== active) return null;
  return <div className="pt-4">{children}</div>;
}
