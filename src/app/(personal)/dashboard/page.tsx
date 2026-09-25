"use client";

import { Badge, Button, Card, PageHeader, Skeleton } from "@/components/ui";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  Calendar,
  CreditCard,
  MessageCircle,
  Sparkles,
  Users,
  Dumbbell,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.getDashboard>> | null>(null);

  useEffect(() => {
    api.getDashboard().then(setData);
  }, []);

  if (!data) {
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

  const cards = [
    { label: "Alunos ativos", value: data.activeStudents, href: "/alunos", icon: Users },
    { label: "Treinos na semana", value: data.workoutsThisWeek, href: "/treinos", icon: Dumbbell },
    { label: "Cobranças pendentes", value: data.pendingInvoices, href: "/cobrancas", icon: CreditCard },
    { label: "Mensagens não lidas", value: data.unreadMessages, href: "/chat", icon: MessageCircle },
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
            <Link href="/treinos/novo">
              <Button variant="secondary" size="sm">
                Novo treino
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
                  <Icon className="h-4 w-4 text-brand" />
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
            <h2 className="text-subtitle">Próximos eventos</h2>
            <Link href="/agenda" className="text-sm text-brand">
              Ver agenda
            </Link>
          </div>
          <ul className="space-y-3">
            {data.upcomingEvents.map((e) => (
              <li
                key={e.id}
                className="flex items-start gap-3 rounded-[var(--radius-md)] border border-border p-3"
              >
                <Calendar className="mt-0.5 h-4 w-4 text-brand" />
                <div>
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="text-caption">
                    {e.studentName} · {formatDate(e.startsAt)}
                  </p>
                </div>
                <Badge tone="default" className="ml-auto capitalize">
                  {e.type}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="text-subtitle mb-3">Atividade recente</h2>
          <ul className="space-y-3">
            {data.recentActivity.map((a) => (
              <li key={a.id} className="border-b border-border pb-3 last:border-0">
                <p className="text-sm">{a.text}</p>
                <p className="text-caption">{formatDate(a.at)}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
