"use client";

import { Avatar } from "@/components/ui";
import { AppName } from "@/components/ui/AppName";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useProfile } from "@/lib/profile";
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
import { useEffect, useState, type ReactNode } from "react";

const iconColor = {
  "/dashboard": "#3b82f6",
  "/alunos": "#22c55e",
  "/treinos": "#f97316",
  "/agenda": "#eab308",
  "/chat": "#06b6d4",
  "/cobrancas": "#ec4899",
  "/avaliacoes": "#a855f7",
  "/configuracoes": "#e50914",
} as const;

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

function MenuMark({
  href,
  icon: Icon,
}: {
  href: string;
  icon: typeof LayoutDashboard;
}) {
  const color = iconColor[href as keyof typeof iconColor] ?? "#e50914";
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px]"
      style={{ backgroundColor: `${color}24`, color }}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
    </span>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

export function PersonalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const profile = useProfile();
  const name = profile?.name ?? "";
  const studio = profile?.studioName || "Meu studio";
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem("nfit_sidebar") === "icons");
  }, []);

  function toggleSidebar() {
    setCollapsed((open) => {
      const next = !open;
      localStorage.setItem("nfit_sidebar", next ? "icons" : "full");
      return next;
    });
  }

  return (
    <div className="min-h-dvh bg-bg md:flex">
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-border bg-surface transition-[width] md:flex",
          collapsed ? "w-[4.5rem]" : "w-60",
        )}
      >
        <div className={cn("border-b border-border py-5", collapsed ? "px-2" : "px-4")}>
          <button
            type="button"
            onClick={toggleSidebar}
            className={cn("rounded-[var(--radius-md)]", collapsed && "mx-auto flex")}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Abrir o menu" : "Recolher o menu e deixar só os ícones"}
          >
            <AppName size="lg" iconOnly={collapsed} />
          </button>
          {collapsed ? null : <p className="mt-2 truncate text-caption">{studio}</p>}
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {sidebar.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-base font-semibold transition",
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-brand-muted text-brand-hover"
                    : "text-text-muted hover:bg-hover hover:text-text",
                )}
              >
                <MenuMark href={item.href} icon={Icon} />
                {collapsed ? <span className="sr-only">{item.label}</span> : item.label}
              </Link>
            );
          })}
        </nav>
        <div className={cn("border-t border-border p-4", collapsed && "px-2")}>
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <Avatar name={name || "?"} size="md" />
            {collapsed ? null : (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{name || "…"}</p>
                <p className="truncate text-caption">Personal</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur md:px-6">
          <AppName className="md:hidden" />
          <p className="hidden text-base font-semibold text-text-muted md:block">Área do Personal</p>
          <div className="flex items-center gap-2">
            <ThemeToggle labeled />
            <Avatar name={name || "?"} size="sm" className="md:hidden" />
          </div>
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
                    "flex min-h-16 flex-col items-center justify-center gap-1 text-sm font-semibold",
                    active ? "text-brand" : "text-text-muted",
                  )}
                >
                  <MenuMark href={item.href} icon={Icon} />
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
