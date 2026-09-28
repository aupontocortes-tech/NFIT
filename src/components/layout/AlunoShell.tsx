"use client";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { AppName } from "@/components/ui/AppName";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Calendar,
  ClipboardList,
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
  { href: "/aluno/avaliacao", label: "Avaliação", icon: ClipboardList, color: "#e50914" },
  { href: "/aluno/perfil", label: "Perfil", icon: User, color: "#22c55e" },
];

export function AlunoShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [name, setName] = useState("");
  const [due, setDue] = useState("");
  const isExecution =
    /\/aluno\/treino\/[^/]+$/.test(pathname) && !pathname.includes("/resumo");

  useEffect(() => {
    const id = localStorage.getItem("nfit_aluno_id");
    if (!id) return;
    api.getStudent(id).then((s) => {
      setName(s.name.split(/\s+/)[0] || s.name);
      if (s.nextAssessmentAt && new Date(s.nextAssessmentAt).getTime() <= Date.now()) {
        setDue(s.nextAssessmentAt);
        const key = `nfit_eval_alert_${s.id}_${s.nextAssessmentAt}`;
        if (typeof Notification !== "undefined" && !localStorage.getItem(key)) {
          const show = () => {
            new Notification("NFIT", { body: "Está na hora da sua avaliação física." });
            localStorage.setItem(key, "1");
          };
          if (Notification.permission === "granted") show();
          else if (Notification.permission === "default") {
            Notification.requestPermission().then((p) => {
              if (p === "granted") show();
            });
          }
        }
      }
    }).catch(() => setName(""));
  }, []);

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur">
        <div>
          <AppName />
          <p className="text-caption">{name ? `Olá, ${name}` : "Área do aluno"}</p>
        </div>
        <LogoutButton compact />
      </header>
      {due ? (
        <div className="border-b border-brand bg-brand px-4 py-3 text-sm font-semibold text-text-inverse">
          Está na hora da sua avaliação física. A personal marcou este horário:{" "}
          {new Date(due).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}.
        </div>
      ) : null}
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
