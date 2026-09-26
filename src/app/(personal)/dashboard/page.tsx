"use client";

import { Button, Card, Empty, PageHeader, Skeleton } from "@/components/ui";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Calendar, CreditCard, MessageCircle, Sparkles, Users, Dumbbell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { EventItem, Student } from "@/lib/mocks";

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [events, setEvents] = useState<EventItem[] | null>(null);

  useEffect(() => {
    api.listStudents().then((r) => setStudents(r.items)).catch(() => setStudents([]));
    api.listEvents().then((r) => setEvents(r.items)).catch(() => setEvents([]));
  }, []);

  if (!students || !events) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  const now = new Date();
  const weekStart = new Date(now);
  const day = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - (day === 0 ? 6 : day - 1));
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const active = students.filter((s) => s.status === "active");
  const upcoming = events
    .filter((e) => e.status !== "cancelled" && new Date(e.startsAt) >= now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, 5);
  const thisWeek = events.filter((e) => {
    const t = new Date(e.startsAt);
    return e.status !== "cancelled" && t >= weekStart && t < weekEnd;
  });

  const cards = [
    { label: "Alunos ativos", value: active.length, href: "/alunos", icon: Users },
    { label: "Aulas na semana", value: thisWeek.length, href: "/agenda", icon: Dumbbell },
    { label: "Cobranças pendentes", value: 0, href: "/cobrancas", icon: CreditCard },
    { label: "Mensagens não lidas", value: 0, href: "/chat", icon: MessageCircle },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Resumo do seu studio"
        action={
          <>
            <Link href="/alunos/novo">
              <Button variant="secondary" size="sm">
                Novo aluno
              </Button>
            </Link>
            <Link href="/agenda">
              <Button variant="secondary" size="sm">
                Agenda
              </Button>
            </Link>
            <Link href="/treinos/gerar">
              <Button variant="ai" size="sm">
                <Sparkles className="h-4 w-4" />
                Gerar com IA
              </Button>
            </Link>
          </>
        }
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.label} href={c.href}>
              <Card className="cursor-pointer transition hover:bg-hover">
                <div className="flex items-start justify-between">
                  <p className="text-caption">{c.label}</p>
                  <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-brand-muted text-brand">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                </div>
                <p className="mt-2 text-4xl font-bold tabular-nums">{c.value}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-subtitle">Alunos</h2>
            <Link href="/alunos" className="text-sm text-brand">
              Ver todos
            </Link>
          </div>
          {active.length === 0 ? (
            <Empty title="Nenhum aluno cadastrado" />
          ) : (
            <ul className="space-y-2">
              {active.map((s) => (
                <li key={s.id}>
                  <Link href={`/alunos/${s.id}`} className="block rounded-[var(--radius-md)] border border-border px-3 py-2 hover:bg-hover">
                    <p className="font-medium">{s.name}</p>
                    <p className="text-caption">Desde {formatDate(s.createdAt)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-subtitle">Próximas aulas</h2>
            <Link href="/agenda" className="text-sm text-brand">
              Ver agenda
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <Empty icon={Calendar} title="Nenhuma aula marcada" />
          ) : (
            <ul className="space-y-3">
              {upcoming.map((e) => (
                <li key={e.id} className="rounded-[var(--radius-md)] border border-border p-3">
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="text-caption">
                    {e.studentName} · {formatDate(e.startsAt)} ·{" "}
                    {new Date(e.startsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
