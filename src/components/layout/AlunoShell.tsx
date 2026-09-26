"use client";

import { AppName } from "@/components/ui/AppName";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { api } from "@/lib/api";
import type { Student } from "@/lib/mocks";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Dumbbell,
  LineChart,
  MessageCircle,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const nav = [
  { href: "/aluno", label: "Treino", icon: Dumbbell, exact: true, color: "#f97316" },
  { href: "/aluno/agenda", label: "Agenda", icon: Calendar, color: "#eab308" },
  { href: "/aluno/chat", label: "Chat", icon: MessageCircle, color: "#06b6d4" },
  { href: "/aluno/evolucao", label: "Evolução", icon: LineChart, color: "#a855f7" },
  { href: "/aluno/perfil", label: "Perfil", icon: User, color: "#22c55e" },
];

export function AlunoShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [students, setStudents] = useState<Student[]>([]);
  const [alunoId, setAlunoId] = useState("");
  const isExecution =
    /\/aluno\/treino\/[^/]+$/.test(pathname) && !pathname.includes("/resumo");

  useEffect(() => {
    api.listStudents({ status: "active" }).then((r) => {
      setStudents(r.items);
      const saved = localStorage.getItem("nfit_aluno_id");
      const id = r.items.find((s) => s.id === saved)?.id ?? r.items[0]?.id ?? "";
      if (id) localStorage.setItem("nfit_aluno_id", id);
      setAlunoId(id);
    }).catch(() => setStudents([]));
  }, []);

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur">
        <div>
          <AppName />
          <p className="text-caption">Área do aluno</p>
          {students.length > 1 ? (
            <select
              className="mt-1 h-9 rounded-[var(--radius-md)] border border-border bg-surface px-2 text-sm"
              value={alunoId}
              onChange={(e) => {
                localStorage.setItem("nfit_aluno_id", e.target.value);
                setAlunoId(e.target.value);
                window.location.reload();
              }}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          ) : null}
        </div>
        <ThemeToggle labeled />
      </header>
      <main
        className={cn(
          "mx-auto w-full max-w-lg px-4 py-6",
          isExecution ? "pb-6" : "pb-24",
        )}
      >
        {children}
      </main>
      {!isExecution ? (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface">
          <ul className="mx-auto flex max-w-lg">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? pathname === item.href || pathname === "/aluno/inicio"
                : pathname.startsWith(item.href);
              return (
                <li key={item.href} className="flex-1">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex min-h-16 flex-col items-center justify-center gap-1 text-sm font-semibold",
                      active ? "text-brand" : "text-text-muted",
                    )}
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-[11px]"
                      style={{ backgroundColor: `${item.color}24`, color: item.color }}
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
