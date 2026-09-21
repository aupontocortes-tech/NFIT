"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";
import { useAuth } from "./auth-provider";
import { cn } from "./ui";
import { USE_MOCK } from "@/lib/env";

const personalNav = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/alunos", label: "Alunos", icon: Users },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/treinos", label: "Treinos", icon: Dumbbell },
  { href: "/pagamentos", label: "Pagamentos", icon: CreditCard },
];

const alunoNav = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/agenda", label: "Minha agenda", icon: CalendarDays },
  { href: "/treinos", label: "Meus treinos", icon: Dumbbell },
  { href: "/pagamentos", label: "Mensalidade", icon: CreditCard },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, ready, logout } = useAuth();
  const pathname = usePathname();

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-zinc-400">
        Carregando sessão…
      </div>
    );
  }

  const nav = user.role === "PERSONAL" ? personalNav : alunoNav;

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-white/8 bg-[#08110d] md:flex md:flex-col">
        <div className="flex items-center gap-2 px-5 py-6">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime-300 text-[#10210f]">
            <Dumbbell className="h-4 w-4" />
          </span>
          <div>
            <p className="font-[family-name:var(--font-display)] text-lg leading-none tracking-tight">nfit</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-zinc-500">fase 1</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  active ? "bg-lime-300/12 text-lime-200" : "text-zinc-400 hover:bg-white/4 hover:text-white",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/8 p-4">
          <p className="truncate text-sm text-zinc-200">{user.name}</p>
          <p className="truncate text-xs text-zinc-500">{user.email}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-rose-300"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/8 bg-[#0b1511]/90 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <Dumbbell className="h-4 w-4 text-lime-300" />
            <span className="font-[family-name:var(--font-display)]">nfit</span>
          </div>
          <p className="hidden text-sm text-zinc-400 md:block">
            {user.role === "PERSONAL" ? "Painel do personal" : "Área do aluno"}
            {USE_MOCK ? " · mock local" : " · API"}
          </p>
          <button type="button" onClick={logout} className="text-sm text-zinc-400 md:hidden">
            Sair
          </button>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>

        <nav className="sticky bottom-0 grid grid-cols-4 border-t border-white/8 bg-[#08110d] px-1 py-2 md:hidden">
          {nav.slice(0, 4).map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg py-1.5 text-[11px]",
                  active ? "text-lime-200" : "text-zinc-500",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label.replace("Minha ", "").replace("Meus ", "")}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
