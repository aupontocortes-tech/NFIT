"use client";

import { Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CreditCard,
  ClipboardList,
  LayoutDashboard,
  MessageCircle,
  MoreHorizontal,
  Settings,
  Users,
  Dumbbell,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const sidebar = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/alunos", label: "Alunos", icon: Users },
  { href: "/treinos", label: "Treinos", icon: Dumbbell },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/cobrancas", label: "Cobranças", icon: CreditCard },
  { href: "/avaliacoes", label: "Avaliações", icon: ClipboardList },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

const mobileNav = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/alunos", label: "Alunos", icon: Users },
  { href: "/treinos", label: "Treinos", icon: Dumbbell },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/configuracoes", label: "Mais", icon: MoreHorizontal },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

export function PersonalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-bg md:flex">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="flex items-center gap-2 border-b border-border px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-brand text-text-inverse font-bold">
            P
          </div>
          <div>
            <p className="text-sm font-semibold">nfit</p>
            <p className="text-caption">Studio nfit</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {sidebar.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-brand-muted text-brand-hover"
                    : "text-text-muted hover:bg-gray-50 hover:text-text",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <Avatar name="Ana Souza" size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">Ana Souza</p>
              <p className="truncate text-caption">Personal</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface/95 px-4 py-3 backdrop-blur md:px-6">
          <p className="text-sm font-semibold md:hidden">nfit</p>
          <p className="hidden text-sm text-text-muted md:block">Área do Personal</p>
          <Avatar name="Ana Souza" size="sm" className="md:hidden" />
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 md:px-6 md:pb-8">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface md:hidden">
        <ul className="flex">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                    active ? "text-brand" : "text-text-muted",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
