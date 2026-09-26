"use client";

import { applyTheme, themeIsDark } from "@/lib/theme";
import { useEffect, useState } from "react";

export function AppearancePicker() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(themeIsDark());
  }, []);

  function choose(mode: "dark" | "light") {
    applyTheme(mode);
    setDark(mode === "dark");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => choose("light")}
        aria-pressed={!dark}
        className={`h-10 rounded-[var(--radius-md)] border px-3 text-sm font-semibold ${dark ? "border-border" : "border-brand bg-brand text-text-inverse"}`}
      >
        Modo claro
      </button>
      <button
        type="button"
        onClick={() => choose("dark")}
        aria-pressed={dark}
        className={`h-10 rounded-[var(--radius-md)] border px-3 text-sm font-semibold ${dark ? "border-brand bg-brand text-text-inverse" : "border-border"}`}
      >
        Modo escuro
      </button>
    </div>
  );
}
