"use client";

import { applyTheme, themeIsDark } from "@/lib/theme";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle({ labeled = false }: { labeled?: boolean }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(themeIsDark());
  }, []);

  function toggle() {
    const next = !themeIsDark();
    applyTheme(next ? "dark" : "light");
    setDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3 text-base font-semibold text-text transition hover:bg-hover"
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      {labeled ? (dark ? "Modo claro" : "Modo escuro") : <span className="sr-only">{dark ? "Modo claro" : "Modo escuro"}</span>}
    </button>
  );
}
