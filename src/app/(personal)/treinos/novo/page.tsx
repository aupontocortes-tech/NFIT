"use client";

import { Button, Card, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { ExerciseGif } from "@/components/workouts/ExerciseGif";
import { api, ApiError } from "@/lib/api";
import type { Student } from "@/lib/mocks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NovoTreinoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState({
    title: "",
    goal: "",
    notes: "",
    exerciseName: "",
    sets: "3",
    reps: "10",
    studentId: "",
  });

  useEffect(() => {
    api.listStudents({ status: "active" }).then((r) => setStudents(r.items)).catch(() => setStudents([]));
  }, []);

  function workoutBody(status: "draft" | "template") {
    return {
      title: form.title,
      goal: form.goal,
      notes: form.notes,
      status,
      blocks: [
        {
          name: "Bloco 1",
          order: 0,
          exercises: form.exerciseName
            ? [
                {
                  name: form.exerciseName,
                  sets: Number(form.sets),
                  reps: form.reps,
                  order: 0,
                },
              ]
            : [],
        },
      ],
    };
  }

  async function saveForStudent() {
    if (!form.studentId) {
      toast("Escolha o aluno para salvar o treino", "error");
      return;
    }
    setLoading(true);
    try {
      const w = await api.createWorkout(workoutBody("draft"));
      await api.createAssignments({
        workoutId: w.id,
        studentIds: [form.studentId],
        startDate: new Date().toISOString().slice(0, 10),
      });
      toast("Treino salvo para o aluno");
      router.push(`/treinos/${w.id}`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Não foi possível salvar o treino", "error");
    } finally {
      setLoading(false);
    }
  }

  async function saveTemplate() {
    setLoading(true);
    try {
      const w = await api.createWorkout(workoutBody("template"));
      toast("Template salvo");
      router.push(`/treinos/${w.id}`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Não foi possível salvar o treino", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Novo treino" description="Criação manual" />
      <Card className="max-w-2xl space-y-4">
        <Select
          label="Aluno"
          value={form.studentId}
          onChange={(e) => setForm({ ...form, studentId: e.target.value })}
        >
          <option value="">Escolha o aluno</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Input
          label="Nome"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <Input
          label="Objetivo"
          value={form.goal}
          onChange={(e) => setForm({ ...form, goal: e.target.value })}
          placeholder="Hipertrofia, emagrecimento…"
        />
        <Textarea
          label="Notas"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <div className="rounded-[var(--radius-md)] border border-border p-3">
          <p className="mb-2 text-sm font-medium">Primeiro exercício</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-end gap-3 sm:col-span-3">
              <ExerciseGif name={form.exerciseName} size="md" />
              <Input
                label="Exercício"
                value={form.exerciseName}
                onChange={(e) =>
                  setForm({ ...form, exerciseName: e.target.value })
                }
                className="min-w-0 flex-1"
              />
            </div>
            <Input
              label="Séries"
              value={form.sets}
              onChange={(e) => setForm({ ...form, sets: e.target.value })}
            />
            <Input
              label="Reps"
              value={form.reps}
              onChange={(e) => setForm({ ...form, reps: e.target.value })}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button loading={loading} onClick={saveForStudent} disabled={!form.title}>
            Salvar para o aluno
          </Button>
          <Button variant="secondary" loading={loading} onClick={saveTemplate} disabled={!form.title}>
            Salvar template
          </Button>
          <Link href="/treinos">
            <Button variant="ghost">Cancelar</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
