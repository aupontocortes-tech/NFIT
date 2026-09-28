"use client";

import {
  Badge,
  Button,
  Card,
  Input,
  Modal,
  PageHeader,
  Textarea,
} from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { ExerciseGif } from "@/components/workouts/ExerciseGif";
import { api, ApiError } from "@/lib/api";
import { aiDraftFixture, type Student, type Workout } from "@/lib/mocks";
import { AlertTriangle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RascunhoIaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [workout, setWorkout] = useState<Workout>(aiDraftFixture);
  const [draftId, setDraftId] = useState("draft-mock-001");
  const [saving, setSaving] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  useEffect(() => {
    // Lê o rascunho salvo pela tela anterior (só existe no navegador)
    Promise.resolve().then(() => {
      try {
        const raw = sessionStorage.getItem("ai-draft");
        if (raw) {
          const parsed = JSON.parse(raw) as { draftId: string; workout: Workout; studentId?: string };
          setDraftId(parsed.draftId);
          setWorkout(parsed.workout);
          if (parsed.studentId) {
            setStudentId(parsed.studentId);
            setSelected([parsed.studentId]);
          }
        }
      } catch {
        /* keep fixture */
      }
    });
    api.listStudents({ status: "active" }).then((r) => setStudents(r.items));
  }, []);

  async function saveDraft() {
    setSaving(true);
    try {
      const payload = { ...workout, status: "draft" as const, generatedByAi: true };
      const w =
        workout.id && !workout.id.startsWith("w-ai")
          ? await api.updateWorkout(workout.id, payload)
          : await api.createWorkout(payload);
      toast("Rascunho salvo (não atribuído)");
      router.push(`/treinos/${w.id}`);
    } finally {
      setSaving(false);
    }
  }

  async function regenerate() {
    setSaving(true);
    try {
      const res = await api.regenerateWorkoutAi(draftId);
      setWorkout(res.workout);
      toast("Novo rascunho gerado", "info");
    } finally {
      setSaving(false);
    }
  }

  async function saveForStudent(ids: string[]) {
    if (ids.length === 0) {
      setAssignOpen(true);
      return;
    }
    setSaving(true);
    try {
      const payload = { ...workout, status: "draft" as const, generatedByAi: true };
      const w =
        workout.id && !workout.id.startsWith("w-ai")
          ? await api.updateWorkout(workout.id, payload)
          : await api.createWorkout(payload);
      await api.createAssignments({
        workoutId: w.id,
        studentIds: ids,
        startDate,
      });
      toast("Treino salvo para o aluno");
      setAssignOpen(false);
      router.push(`/treinos/${w.id}`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Não foi possível salvar o treino", "error");
    } finally {
      setSaving(false);
    }
  }

  const warnings = workout.warnings?.filter(Boolean) ?? [];

  return (
    <div>
      <PageHeader
        title="Revisar rascunho IA"
        description="Edite o que precisar. Publicar/atribuir só com sua confirmação."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge tone="draft" />
        <Badge tone="ai" />
      </div>

      {warnings.length > 0 ? (
        <div
          role="alert"
          className="mb-4 rounded-[var(--radius-lg)] border border-warning bg-brand-muted p-4 text-ai-text"
        >
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
            Avisos para revisão humana
          </div>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}

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
          <h3 className="text-subtitle mb-3">{block.name ?? `Bloco ${bi + 1}`}</h3>
          {block.warmUp ? (
            <p className="mb-2 text-sm text-text-muted">
              <span className="font-semibold text-text">Aquecimento: </span>
              {block.warmUp}
            </p>
          ) : null}
          {block.coolDown ? (
            <p className="mb-3 text-sm text-text-muted">
              <span className="font-semibold text-text">Volta à calma: </span>
              {block.coolDown}
            </p>
          ) : null}
          <ul className="space-y-2">
            {block.exercises.map((ex, ei) => (
              <li
                key={ei}
                className="rounded-[var(--radius-md)] border border-border p-3"
              >
                <div className="flex items-start gap-3">
                  <ExerciseGif name={ex.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <Input
                      label="Exercício"
                      value={ex.name}
                      onChange={(e) => {
                        const blocks = [...workout.blocks];
                        blocks[bi] = {
                          ...block,
                          exercises: block.exercises.map((x, i) =>
                            i === ei ? { ...x, name: e.target.value } : x,
                          ),
                        };
                        setWorkout({ ...workout, blocks });
                      }}
                    />
                    <p className="mt-2 text-caption tabular-nums">
                      {ex.sets}×{ex.reps}
                      {ex.intensity ? ` · ${ex.intensity}` : ex.load ? ` · ${ex.load}` : ""}
                      {ex.restSeconds ? ` · ${ex.restSeconds}s` : ""}
                    </p>
                    {ex.notes ? (
                      <p className="mt-1 text-sm text-text-muted">{ex.notes}</p>
                    ) : null}
                    {ex.alternatives && ex.alternatives.length > 0 ? (
                      <p className="mt-1 text-sm text-text-muted">
                        <span className="font-semibold text-text">Alternativas: </span>
                        {ex.alternatives.join(" · ")}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <div className="sticky bottom-20 z-10 flex flex-col gap-2 rounded-[var(--radius-lg)] border border-border bg-surface p-3 shadow-md md:bottom-6 md:flex-row">
        <Button variant="ai" loading={saving} onClick={regenerate}>
          <Sparkles className="h-4 w-4" />
          Regenerar
        </Button>
        <Button variant="secondary" loading={saving} onClick={saveDraft}>
          Salvar rascunho
        </Button>
        <Button loading={saving} onClick={() => saveForStudent(selected.length ? selected : studentId ? [studentId] : [])}>
          Salvar para o aluno
        </Button>
        <Link href="/treinos/gerar">
          <Button variant="ghost">Voltar</Button>
        </Link>
      </div>

      <Modal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Confirmar atribuição"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssignOpen(false)}>
              Cancelar
            </Button>
            <Button
              loading={saving}
              disabled={selected.length === 0}
              onClick={() => saveForStudent(selected)}
            >
              Confirmar
            </Button>
          </>
        }
      >
        <p className="mb-4 text-body-sm text-text-muted">
          Escolha o aluno. O treino fica na área dele.
        </p>
        <Input
          label="Data de início"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mb-4"
        />
        <ul className="space-y-2">
          {students.map((s) => (
            <li key={s.id}>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-border px-3">
                <input
                  type="checkbox"
                  checked={selected.includes(s.id)}
                  onChange={() =>
                    setSelected((prev) =>
                      prev.includes(s.id)
                        ? prev.filter((x) => x !== s.id)
                        : [...prev, s.id],
                    )
                  }
                />
                <span className="text-sm">{s.name}</span>
              </label>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}
