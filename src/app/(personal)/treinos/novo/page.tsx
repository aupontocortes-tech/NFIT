"use client";

import { ManualExerciseBoard, type ManualExercise } from "@/components/workouts/ManualExerciseBoard";
import { Avatar, Button, Card, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api";
import { presetExercises, workoutPresets } from "@/lib/workout-presets";
import type { Student } from "@/lib/mocks";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function NovoTreinoPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [exercises, setExercises] = useState<ManualExercise[]>([]);
  const [presetId, setPresetId] = useState("");
  const [form, setForm] = useState({
    title: "",
    goal: "",
    notes: "",
    studentId: "",
  });

  useEffect(() => {
    const aluno = search.get("aluno") ?? "";
    if (aluno) setForm((current) => ({ ...current, studentId: aluno }));
    api.listStudents({ status: "active" }).then((r) => setStudents(r.items)).catch(() => setStudents([]));
  }, [search]);

  function studentName() {
    return students.find((student) => student.id === form.studentId)?.name ?? "";
  }

  function applyPreset(id: string) {
    const preset = workoutPresets.find((item) => item.id === id);
    if (!preset) return;
    setPresetId(id);
    setExercises(presetExercises(preset));
    setForm((current) => ({ ...current, goal: preset.goal }));
    toast(`${preset.label} colocado. Ajuste o que quiser.`);
  }

  function workoutBody(status: "draft" | "template") {
    const preset = workoutPresets.find((item) => item.id === presetId);
    const who = studentName();
    const title = preset ? `${preset.label}${who ? ` — ${who}` : ""}` : who || form.title;
    return {
      title,
      goal: form.goal,
      notes: form.notes,
      status,
      blocks: [
        {
          name: preset?.focus ?? "Bloco 1",
          order: 0,
          exercises: exercises.map((exercise, index) => ({
            name: exercise.name,
            sets: Number(exercise.sets) || 3,
            reps: exercise.reps || "10",
            restSeconds: Number(exercise.rest) || undefined,
            demoId: exercise.demoId,
            order: index,
          })),
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

  const name = studentName();

  return (
    <div>
      <PageHeader
        title="Montar sem IA"
        description="Escolha o aluno, digite a palavra e monte o treino pelo desenho."
        action={
          <Link href="/treinos/gerar">
            <Button variant="secondary" size="sm">Gerar com IA</Button>
          </Link>
        }
      />
      <Card className="max-w-5xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#22c55e] via-[#06b6d4] to-[#3b82f6] px-5 py-4 text-white">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80">Treino na mão</p>
          <p className="mt-1 text-lg font-semibold">
            {name ? name : "Escolha o aluno para começar"}
          </p>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-muted">Comece por um modelo</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {workoutPresets.map((preset) => {
              const selected = presetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => applyPreset(preset.id)}
                  className="rounded-[var(--radius-lg)] border-2 px-3 py-3 text-left"
                  style={{
                    borderColor: preset.color,
                    backgroundColor: selected ? preset.color : `${preset.color}22`,
                    color: selected ? "#ffffff" : preset.color,
                  }}
                >
                  <span className="block text-lg font-bold">{preset.label}</span>
                  <span className="mt-1 block text-sm" style={{ color: selected ? "#ffffff" : undefined }}>
                    {preset.focus}
                  </span>
                  <span className="mt-1 block text-xs opacity-80">{preset.exercises.length} exercícios</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="space-y-4">
            <div className="rounded-[var(--radius-lg)] border border-[#22c55e] bg-[#22c55e]/10 p-3">
              {name ? (
                <div className="mb-3 flex items-center gap-3">
                  <Avatar name={name} size="lg" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#22c55e]">Aluno</p>
                    <p className="text-lg font-semibold text-text">{name}</p>
                  </div>
                </div>
              ) : null}
              <Select
                label={name ? "Trocar aluno" : "Aluno"}
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
            </div>
            {form.studentId ? null : (
              <Input
                label="Nome do treino"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            )}
            <div className="rounded-[var(--radius-lg)] border border-[#a855f7] bg-[#a855f7]/10 p-3">
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
                className="mt-3"
              />
            </div>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[#f97316] bg-[#f97316]/10 p-4">
            <ManualExerciseBoard items={exercises} onChange={setExercises} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button loading={loading} onClick={saveForStudent} disabled={!form.studentId}>
            Salvar para o aluno
          </Button>
          <Button variant="secondary" loading={loading} onClick={saveTemplate} disabled={!name && !form.title}>
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
