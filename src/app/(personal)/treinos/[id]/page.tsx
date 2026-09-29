"use client";

import { ExerciseDemoField } from "@/components/workouts/ExerciseDemo";
import { exerciseColor } from "@/lib/exercise-color";
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
import { api } from "@/lib/api";
import type { Exercise, Workout } from "@/lib/mocks";
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

  function updateExercise(blockIndex: number, exerciseIndex: number, patch: Partial<Exercise>) {
    setWorkout((current) => {
      if (!current) return current;
      return {
        ...current,
        blocks: current.blocks.map((block, index) =>
          index === blockIndex
            ? {
                ...block,
                exercises: block.exercises.map((exercise, itemIndex) =>
                  itemIndex === exerciseIndex ? { ...exercise, ...patch } : exercise,
                ),
              }
            : block,
        ),
      };
    });
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
        {workout.level ? <Badge>{workout.level}</Badge> : null}
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
            {block.exercises.map((ex, ei) => {
              const color = exerciseColor(
                workout.blocks.slice(0, bi).reduce((total, item) => total + item.exercises.length, 0) + ei,
              );
              return (
              <li
                key={ei}
                className="rounded-[var(--radius-md)] border border-border border-l-4 p-3"
                style={{ borderLeftColor: color }}
              >
                <Input
                  label="Exercício"
                  value={ex.name}
                  style={{ color }}
                  onChange={(event) =>
                    updateExercise(bi, ei, { name: event.target.value, demoId: undefined })
                  }
                />
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Input
                    label="Séries"
                    value={String(ex.sets)}
                    onChange={(event) =>
                      updateExercise(bi, ei, { sets: Number(event.target.value.replace(/\D/g, "")) || 0 })
                    }
                  />
                  <Input
                    label="Repetições"
                    value={ex.reps}
                    onChange={(event) => updateExercise(bi, ei, { reps: event.target.value })}
                  />
                  <Input
                    label="Descanso (s)"
                    value={ex.restSeconds ? String(ex.restSeconds) : ""}
                    onChange={(event) =>
                      updateExercise(bi, ei, {
                        restSeconds: Number(event.target.value.replace(/\D/g, "")) || undefined,
                      })
                    }
                  />
                </div>
                <ExerciseDemoField
                  demoId={ex.demoId}
                  name={ex.name}
                  onPick={(item) => updateExercise(bi, ei, { demoId: item.id })}
                />
                {ex.notes ? (
                  <p className="mt-1 text-sm text-text-muted">{ex.notes}</p>
                ) : null}
              </li>
              );
            })}
          </ul>
        </Card>
      ))}
    </div>
  );
}
