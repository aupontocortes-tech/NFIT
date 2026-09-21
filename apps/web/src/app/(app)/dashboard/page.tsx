"use client";

import Link from "next/link";
import { getDashboard } from "@/lib/api";
import { formatDateTime, sessionLabel } from "@/lib/format";
import { useAsync } from "@/lib/use-async";
import { Badge, Card, Empty } from "@/components/ui";

export default function DashboardPage() {
  const { data, error, loading } = useAsync(() => getDashboard(), []);

  if (loading) return <p className="text-sm text-zinc-400">Carregando painel…</p>;
  if (error || !data) return <p className="text-sm text-rose-300">{error}</p>;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-lime-300/80">Hoje</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight">{data.greeting}</h1>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((kpi) => (
          <Card key={kpi.label}>
            <p className="text-xs uppercase tracking-wide text-zinc-500">{kpi.label}</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl">{kpi.value}</p>
            {kpi.hint ? <p className="mt-1 text-xs text-zinc-500">{kpi.hint}</p> : null}
          </Card>
        ))}
      </section>

      {data.alerts.map((alert) => (
        <p key={alert} className="rounded-xl border border-lime-300/20 bg-lime-300/8 px-4 py-3 text-sm text-lime-100">
          {alert}
        </p>
      ))}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-xl">Próximas sessões</h2>
          <Link href="/agenda" className="text-sm text-lime-200 hover:underline">
            Ver agenda
          </Link>
        </div>
        {data.upcoming.length === 0 ? (
          <Empty title="Nada na fila" hint="Quando houver aulas, elas aparecem aqui." />
        ) : (
          <div className="space-y-2">
            {data.upcoming.map((session) => (
              <Card key={session.id} className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{session.title}</p>
                  <p className="text-sm text-zinc-400">
                    {session.studentName} · {formatDateTime(session.startsAt)}
                  </p>
                </div>
                <Badge tone={session.status === "rescheduled" ? "warn" : "accent"}>
                  {sessionLabel[session.status]}
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
