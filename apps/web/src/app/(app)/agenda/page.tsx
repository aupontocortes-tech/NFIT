"use client";

import { getSessions } from "@/lib/api";
import { formatDateTime, formatTime, sessionLabel } from "@/lib/format";
import { useAsync } from "@/lib/use-async";
import { Badge, Card, Empty } from "@/components/ui";

const tone = {
  scheduled: "accent",
  done: "ok",
  canceled: "neutral",
  rescheduled: "warn",
} as const;

export default function AgendaPage() {
  const { data, error, loading } = useAsync(() => getSessions(), []);

  if (loading) return <p className="text-sm text-zinc-400">Carregando agenda…</p>;
  if (error || !data) return <p className="text-sm text-rose-300">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">Agenda</h1>
        <p className="mt-1 text-sm text-zinc-400">Sessões da Fase 1 — status, horário e aluno.</p>
      </div>
      {data.length === 0 ? (
        <Empty title="Agenda vazia" />
      ) : (
        <div className="space-y-2">
          {data.map((session) => (
            <Card key={session.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{session.title}</p>
                <p className="text-sm text-zinc-400">
                  {session.studentName} · {formatDateTime(session.startsAt)} – {formatTime(session.endsAt)}
                </p>
              </div>
              <Badge tone={tone[session.status]}>{sessionLabel[session.status]}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
