"use client";

import {
  Badge,
  Button,
  Card,
  Input,
  PageHeader,
  Skeleton,
  Textarea,
} from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { ExerciseGif } from "@/components/workouts/ExerciseGif";
import { api } from "@/lib/api";
import type { Workout } from "@/lib/mocks";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function TreinoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getWorkout(id).then(setWorkout).catch(() => setWorkout(null));
  }, [id]);

  if (!workout) {
    return <Skeleton className="h-64 w-full" />;
  }

  async function save() {
    if (!workout) return;
    setSaving(true);
    try {
      await api.updateWorkout(workout.id, workout);
      toast("Treino salvo");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={workout.title}
        action={
          <>
            <Link href={`/treinos/${id}/atribuir`}>
              <Button size="sm">Atribuir</Button>
            </Link>
            <Button size="sm" loading={saving} onClick={save}>
              Salvar
            </Button>
          </>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge
          tone={
            workout.status === "draft"
              ? "draft"
              : workout.status === "archived"
                ? "paused"
                : "active"
          }
        />
        {workout.generatedByAi ? <Badge tone="ai" /> : null}
      </div>

      <Card className="mb-4 space-y-3">
        <Input
          label="Nome"
          value={workout.title}
          onChange={(e) => setWorkout({ ...workout, title: e.target.value })}
        />
        <Input
          label="Objetivo"
          value={workout.goal ?? ""}
          onChange={(e) => setWorkout({ ...workout, goal: e.target.value })}
        />
        <Textarea
          label="Notas"
          value={workout.notes ?? ""}
          onChange={(e) => setWorkout({ ...workout, notes: e.target.value })}
        />
      </Card>

      {workout.blocks.map((block, bi) => (
        <Card key={bi} className="mb-4">
          <h3 className="text-subtitle mb-3">
            {block.name ?? `Bloco ${bi + 1}`}
          </h3>
          <ul className="space-y-3">
            {block.exercises.map((ex, ei) => (
              <li
                key={ei}
                className="flex items-start gap-3 rounded-[var(--radius-md)] border border-border p-3"
              >
                <ExerciseGif name={ex.name} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{ex.name}</p>
                  <p className="text-caption tabular-nums">
                    {ex.sets}×{ex.reps}
                    {ex.load ? ` · ${ex.load}` : ""}
                    {ex.restSeconds ? ` · descanso ${ex.restSeconds}s` : ""}
                  </p>
                  {ex.notes ? (
                    <p className="mt-1 text-sm text-text-muted">{ex.notes}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
