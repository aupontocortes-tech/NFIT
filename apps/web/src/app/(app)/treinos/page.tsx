"use client";

import { getWorkouts } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useAsync } from "@/lib/use-async";
import { Card, Empty } from "@/components/ui";

export default function WorkoutsPage() {
  const { data, error, loading } = useAsync(() => getWorkouts(), []);

  if (loading) return <p className="text-sm text-zinc-400">Carregando treinos…</p>;
  if (error || !data) return <p className="text-sm text-rose-300">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">Treinos</h1>
        <p className="mt-1 text-sm text-zinc-400">Planos atribuídos na Fase 1.</p>
      </div>
      {data.length === 0 ? (
        <Empty title="Nenhum treino" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {data.map((workout) => (
            <Card key={workout.id}>
              <p className="text-xs uppercase tracking-wide text-zinc-500">{workout.studentName}</p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl">{workout.title}</h2>
              <p className="mt-2 text-sm text-zinc-400">{workout.focus}</p>
              <p className="mt-4 text-xs text-zinc-500">
                {workout.sessionsPerWeek}x / semana · atualizado {formatDate(workout.updatedAt)}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
