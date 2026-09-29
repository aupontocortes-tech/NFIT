"use client";

import { ExercisePlayback, ExerciseSearch } from "@/components/workouts/ExerciseDemo";
import { exerciseColor } from "@/lib/exercise-color";
import { resolveExerciseMedia } from "@/lib/vital-video";
import { Button, Card, Input, PageHeader, Skeleton } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api";
import type { Assignment } from "@/lib/mocks";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SetState = { done: boolean; reps: string; load: string };

export default function ExecutarTreinoPage() {
  const { atribuicaoId } = useParams<{ atribuicaoId: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const [sets, setSets] = useState<Record<string, SetState[]>>({});
  const [notes, setNotes] = useState("");
  const [finishing, setFinishing] = useState(false);
  const startedAt = useState(() => new Date().toISOString())[0];

  useEffect(() => {
    api.getStudentAssignment(atribuicaoId).then((a) => {
      setAssignment(a);
      const map: Record<string, SetState[]> = {};
      a.workout?.blocks.forEach((b, bi) => {
        b.exercises.forEach((ex, ei) => {
          const key = `${bi}-${ei}`;
          map[key] = Array.from({ length: ex.sets }, () => ({
            done: false,
            reps: ex.reps,
            load: ex.load ?? "",
          }));
        });
      });
      setSets(map);
    });
  }, [atribuicaoId]);

  useEffect(() => {
    if (!assignment?.workout) return;
    assignment.workout.blocks.forEach((block, bi) => {
      block.exercises.forEach((ex, ei) => {
        if (ex.demoId || ex.name.trim().length < 3) return;
        const key = `${bi}-${ei}`;
        const params = new URLSearchParams({ q: ex.name });
        fetch(`/api/exercicios?${params}`)
          .then((r) => (r.ok ? r.json() : { items: [] }))
          .then((data: { items?: { id: string; name: string }[] }) => {
            const items = data.items ?? [];
            const exact = items.find((item) => item.name.toLowerCase() === ex.name.trim().toLowerCase());
            const hit = exact ?? (items.length === 1 ? items[0] : null);
            if (!hit) return;
            setChosen((prev) => (prev[key] ? prev : { ...prev, [key]: hit.id }));
          })
          .catch(() => undefined);
      });
    });
  }, [assignment]);

  function toggleSet(key: string, idx: number) {
    setSets((prev) => ({
      ...prev,
      [key]: prev[key].map((s, i) =>
        i === idx ? { ...s, done: !s.done } : s,
      ),
    }));
  }

  async function conclude() {
    setFinishing(true);
    try {
      await api.completeSession(atribuicaoId, {
        startedAt,
        completedAt: new Date().toISOString(),
        notes,
        entries: Object.entries(sets).map(([key, arr], i) => ({
          exerciseOrder: i,
          setsCompleted: arr.filter((s) => s.done).length,
          reps: arr[0]?.reps,
          load: arr[0]?.load,
          skipped: arr.every((s) => !s.done),
          notes: key,
        })),
      });
      toast("Treino concluído");
      router.push(`/aluno/treino/${atribuicaoId}/resumo`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Não foi possível concluir o treino", "error");
    } finally {
      setFinishing(false);
    }
  }

  if (!assignment?.workout) {
    return <Skeleton className="h-64 w-full" />;
  }

  const w = assignment.workout;

  return (
    <div>
      <PageHeader title={w.title} description="Veja o nome, a execução e marque as séries" />
      {w.blocks.map((block, bi) => (
        <div key={bi} className="mb-6">
          <h2 className="text-subtitle mb-3">{block.name ?? `Bloco ${bi + 1}`}</h2>
          {block.exercises.map((ex, ei) => {
            const key = `${bi}-${ei}`;
            const color = exerciseColor(
              w.blocks.slice(0, bi).reduce((total, item) => total + item.exercises.length, 0) + ei,
            );
            const media = resolveExerciseMedia(ex.name, chosen[key] || ex.demoId);
            return (
              <Card key={key} className="mb-3 border-l-4" style={{ borderLeftColor: color }}>
                <p className="text-title" style={{ color }}>{ex.name}</p>
                <p className="mb-1 text-caption tabular-nums">
                  Meta: {ex.sets}×{ex.reps}
                  {ex.restSeconds ? ` · descanso ${ex.restSeconds}s` : ""}
                </p>
                {media ? (
                  <ExercisePlayback large name={ex.name} demoId={chosen[key] || ex.demoId} />
                ) : (
                  <ExerciseSearch
                    onPick={(item) => setChosen((prev) => ({ ...prev, [key]: item.id }))}
                  />
                )}
                <ul className="mt-3 space-y-2">
                  {(sets[key] ?? []).map((s, si) => (
                    <li key={si} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSet(key, si)}
                        className={cn(
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-base font-semibold",
                          s.done
                            ? "border-text bg-text text-bg"
                            : "border-border text-text",
                        )}
                        aria-label={`Série ${si + 1}`}
                      >
                        {s.done ? <Check className="h-5 w-5" /> : si + 1}
                      </button>
                      <Input
                        placeholder="Reps"
                        value={s.reps}
                        onChange={(e) =>
                          setSets((prev) => ({
                            ...prev,
                            [key]: prev[key].map((x, i) =>
                              i === si ? { ...x, reps: e.target.value } : x,
                            ),
                          }))
                        }
                        className="flex-1"
                      />
                      <Input
                        placeholder="Carga"
                        value={s.load}
                        onChange={(e) =>
                          setSets((prev) => ({
                            ...prev,
                            [key]: prev[key].map((x, i) =>
                              i === si ? { ...x, load: e.target.value } : x,
                            ),
                          }))
                        }
                        className="w-28 shrink-0"
                      />
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      ))}
      <Input
        label="Nota rápida"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="mb-4"
      />
      <div className="sticky bottom-4">
        <Button size="lg" loading={finishing} onClick={conclude}>
          Concluir treino
        </Button>
      </div>
    </div>
  );
}
