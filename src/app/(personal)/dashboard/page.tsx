"use client";

import { Button, Card, Empty, PageHeader, Skeleton } from "@/components/ui";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Calendar, CreditCard, MessageCircle, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { EventItem, Invoice, Student } from "@/lib/mocks";

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [pendingPay, setPendingPay] = useState(0);
  const [unread, setUnread] = useState(0);
  const [due, setDue] = useState<Invoice[]>([]);

  useEffect(() => {
    api.listStudents().then((r) => setStudents(r.items)).catch(() => setStudents([]));
    api.listEvents().then((r) => setEvents(r.items)).catch(() => setEvents([]));
    api.listInvoices().then((r) => {
      const open = r.items.filter((i) => i.status !== "paid");
      setPendingPay(open.length);
      setDue(open);
    }).catch(() => {
      setPendingPay(0);
      setDue([]);
    });
    api.listConversations().then((r) => {
      setUnread(r.items.reduce((n, c) => n + c.unreadCount, 0));
    }).catch(() => setUnread(0));
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
    { label: "Alunos ativos", value: active.length, href: "/alunos", icon: Users, color: "#22c55e" },
    { label: "Aulas na semana", value: thisWeek.length, href: "/agenda", icon: Calendar, color: "#eab308" },
    { label: "Cobranças pendentes", value: pendingPay, href: "/cobrancas", icon: CreditCard, color: "#ec4899" },
    { label: "Mensagens não lidas", value: unread, href: "/chat", icon: MessageCircle, color: "#06b6d4" },
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
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-[10px]"
                    style={{ backgroundColor: `${c.color}24`, color: c.color }}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                </div>
                <p className="mt-2 text-4xl font-bold tabular-nums">{c.value}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      {due.length > 0 ? (
        <Card className="mb-6 border-brand">
          <p className="font-semibold">Cobranças para lembrar</p>
          <ul className="mt-2 space-y-1 text-sm text-text-muted">
            {due.slice(0, 4).map((inv) => (
              <li key={inv.id}>
                <Link href={`/cobrancas/${inv.id}`} className="text-brand">
                  {inv.studentName} · {inv.status === "overdue" ? "atrasada" : "vence"} {formatDate(inv.dueDate)}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-subtitle">Alunos</h2>
            <Link href="/alunos" className="text-sm text-brand">
              Ver todos
            </Link>
          </div>
          {active.length === 0 ? (
            <Empty
              title="Nenhum aluno cadastrado"
              description="Cadastre o primeiro aluno para montar treino e agenda."
              action={
                <Link href="/alunos/novo">
                  <Button size="sm">Novo aluno</Button>
                </Link>
              }
            />
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
            <Empty
              icon={Calendar}
              title="Nenhuma aula marcada"
              description="Marque os dias da semana de cada aluno."
              action={
                <Link href="/agenda">
                  <Button size="sm">Abrir agenda</Button>
                </Link>
              }
            />
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
