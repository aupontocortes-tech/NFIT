"use client";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
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
import type { ReactNode } from "react";

const nav = [
  { href: "/aluno", label: "Treino", icon: Dumbbell, exact: true },
  { href: "/aluno/agenda", label: "Agenda", icon: Calendar },
  { href: "/aluno/chat", label: "Chat", icon: MessageCircle },
  { href: "/aluno/evolucao", label: "Evolução", icon: LineChart },
  { href: "/aluno/perfil", label: "Perfil", icon: User },
];

export function AlunoShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isExecution =
    /\/aluno\/treino\/[^/]+$/.test(pathname) && !pathname.includes("/resumo");

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur">
        <div>
          <p className="text-lg font-bold text-brand">nfit</p>
          <p className="text-caption">Olá, Carlos</p>
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
                    <Icon className="h-6 w-6" />
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
