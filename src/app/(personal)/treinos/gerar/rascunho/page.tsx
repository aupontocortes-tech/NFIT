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
import { api } from "@/lib/api";
import { aiDraftFixture, type Student, type Workout } from "@/lib/mocks";
import { Sparkles } from "lucide-react";
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
          const parsed = JSON.parse(raw) as { draftId: string; workout: Workout };
          setDraftId(parsed.draftId);
          setWorkout(parsed.workout);
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

  async function confirmAssign() {
    if (selected.length === 0) return;
    setSaving(true);
    try {
      const payload = { ...workout, status: "draft" as const, generatedByAi: true };
      const w =
        workout.id && !workout.id.startsWith("w-ai")
          ? await api.updateWorkout(workout.id, payload)
          : await api.createWorkout(payload);
      await api.createAssignments({
        workoutId: w.id,
        studentIds: selected,
        startDate,
      });
      toast("Treino salvo e atribuído");
      setAssignOpen(false);
      router.push(`/treinos/${w.id}`);
    } finally {
      setSaving(false);
    }
  }

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
          <ul className="space-y-2">
            {block.exercises.map((ex, ei) => (
              <li
                key={ei}
                className="rounded-[var(--radius-md)] border border-border p-3"
              >
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
                  {ex.restSeconds ? ` · ${ex.restSeconds}s` : ""}
                </p>
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
        <Button loading={saving} onClick={() => setAssignOpen(true)}>
          Salvar e atribuir
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
              onClick={confirmAssign}
            >
              Confirmar
            </Button>
          </>
        }
      >
        <p className="mb-4 text-body-sm text-text-muted">
          O treino só fica ativo para o aluno após esta confirmação.
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
