"use client";

import {
  Button,
  Card,
  Input,
  PageHeader,
  Select,
  Textarea,
} from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import type { Assessment, Student } from "@/lib/mocks";
import { workoutLevel, workoutLevelLabel, workoutLevels } from "@/lib/workout-level";
import { formatDate } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function GerarIaPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [latest, setLatest] = useState<Assessment | null>(null);
  const [checking, setChecking] = useState(false);
  const [allowWithout, setAllowWithout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    goal: "Hipertrofia",
    daysPerWeek: "3",
    sessionMinutes: "60",
    level: "intermediario",
    constraints: "",
    equipment: "Academia completa",
    prompt: "",
  });

  useEffect(() => {
    const aluno = search.get("aluno") ?? "";
    if (aluno) setForm((current) => ({ ...current, studentId: aluno }));
    api.listStudents().then((r) => setStudents(r.items));
  }, [search]);

  useEffect(() => {
    if (!form.studentId) {
      setLatest(null);
      setChecking(false);
      return;
    }
    setChecking(true);
    setAllowWithout(false);
    api
      .listAssessments(form.studentId)
      .then((r) => setLatest(r.items[0] ?? null))
      .catch(() => setLatest(null))
      .finally(() => setChecking(false));
  }, [form.studentId]);

  function assessmentText(item: Assessment) {
    const m = item.measurements;
    return [
      item.sex === "m" ? "Homem" : item.sex === "f" ? "Mulher" : "",
      item.age ? `Idade: ${item.age}` : "",
      item.heightCm ? `Altura: ${item.heightCm} cm` : "",
      item.weightKg ? `Peso: ${item.weightKg} kg` : "",
      item.bmi ? `IMC: ${item.bmi} (${item.bmiLabel ?? ""})` : "",
      item.whr ? `Cintura/quadril: ${item.whr} (${item.whrLabel ?? ""})` : "",
      item.bodyFatPercent ? `Gordura estimada: ${item.bodyFatPercent}%` : "",
      item.leanMassKg ? `Massa magra: ${item.leanMassKg} kg` : "",
      m.chest ? `Peito: ${m.chest} cm` : "",
      m.bicepsRight || m.bicepsLeft
        ? `Braço direito: ${m.bicepsRight ?? "—"} cm; braço esquerdo: ${m.bicepsLeft ?? "—"} cm`
        : m.biceps
          ? `Braço: ${m.biceps} cm`
          : "",
      m.forearmRight || m.forearmLeft
        ? `Antebraço direito: ${m.forearmRight ?? "—"} cm; antebraço esquerdo: ${m.forearmLeft ?? "—"} cm`
        : m.forearm
          ? `Antebraço: ${m.forearm} cm`
          : "",
      m.waist ? `Cintura: ${m.waist} cm` : "",
      m.abdomen ? `Barriga: ${m.abdomen} cm` : "",
      m.hip ? `Quadril: ${m.hip} cm` : "",
      m.thighRight || m.thighLeft
        ? `Coxa direita: ${m.thighRight ?? "—"} cm; coxa esquerda: ${m.thighLeft ?? "—"} cm`
        : m.thigh
          ? `Coxa: ${m.thigh} cm`
          : "",
      item.notes ? `Como se sente: ${item.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const student = students.find((s) => s.id === form.studentId);
      const res = await api.generateWorkoutAi({
        studentId: form.studentId || undefined,
        studentName: student?.name,
        goal: form.goal,
        daysPerWeek: Number(form.daysPerWeek),
        sessionMinutes: Number(form.sessionMinutes),
        level: workoutLevelLabel(form.level),
        constraints: form.constraints || undefined,
        equipment: form.equipment || undefined,
        prompt: form.prompt || undefined,
        assessment: latest ? assessmentText(latest) : undefined,
      });
      // Persist draft in sessionStorage for review screen (mock)
      sessionStorage.setItem(
        "ai-draft",
        JSON.stringify({
          draftId: res.draftId,
          workout: res.workout,
          studentId: form.studentId || "",
        }),
      );
      if (res.modelMeta.provider === "exemplo") {
        toast("IA não configurada — mostrando um exemplo. Veja o .env.example.", "info");
      }
      router.push("/treinos/gerar/rascunho");
    } catch (err) {
      toast(
        err instanceof Error && err.message ? err.message : "Não foi possível gerar. Tente de novo.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Gerar com IA"
        description="A IA só cria rascunho. Você revisa e decide se salva ou atribui."
        action={
          <Link href={`/treinos/novo${search.get("aluno") ? `?aluno=${encodeURIComponent(search.get("aluno") ?? "")}` : ""}`}>
            <Button variant="secondary" size="sm">Montar sem IA</Button>
          </Link>
        }
      />
      <Card className="max-w-3xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#7c3aed] via-[#e50914] to-[#f97316] px-5 py-4 text-white">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80">Rascunho para revisar</p>
          <p className="mt-1 text-lg font-semibold">O treino só vai para o aluno depois que você salvar.</p>
        </div>
        <form onSubmit={onGenerate} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--radius-md)] border border-[#3b82f6] bg-[#3b82f6]/10 p-3 sm:col-span-2">
            <Select
              label="Aluno"
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            >
              <option value="">Sem aluno</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
            {form.studentId && checking ? (
              <p className="mt-2 text-sm text-text-muted">Procurando a avaliação enviada…</p>
            ) : null}
            {form.studentId && !checking && latest ? (
              <p className="mt-2 rounded-[var(--radius-md)] bg-[#22c55e]/15 px-3 py-2 text-sm text-[#22c55e]">
                A IA vai usar a avaliação enviada em {formatDate(latest.date)}.
              </p>
            ) : null}
            {(!form.studentId || (!checking && !latest)) ? (
              <label className="mt-3 flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={allowWithout}
                  onChange={(e) => setAllowWithout(e.target.checked)}
                />
                <span>
                  O ideal é a cliente ter enviado a avaliação pelo link. Sem ela, o treino fica mais genérico. Gerar mesmo assim.
                </span>
              </label>
            ) : null}
          </div>
          <div className="rounded-[var(--radius-md)] border border-[#a855f7] bg-[#a855f7]/10 p-3 sm:col-span-2">
            <Input
              label="Objetivo"
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <p className="mb-2 text-base font-semibold text-text">Nível</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {workoutLevels.map((item) => {
                const selected = workoutLevel(form.level) === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setForm({ ...form, level: item.id })}
                    className="rounded-[var(--radius-md)] border-2 px-3 py-3 text-left"
                    style={{
                      borderColor: item.color,
                      backgroundColor: selected ? item.color : `${item.color}22`,
                      color: selected ? "#ffffff" : item.color,
                    }}
                  >
                    <span className="block text-base font-semibold">{item.label}</span>
                    <span className="mt-1 block text-sm" style={{ color: selected ? "#ffffff" : undefined }}>
                      {item.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <Input
            label="Dias/semana"
            type="number"
            min={1}
            max={7}
            value={form.daysPerWeek}
            onChange={(e) => setForm({ ...form, daysPerWeek: e.target.value })}
          />
          <Input
            label="Duração (min)"
            type="number"
            value={form.sessionMinutes}
            onChange={(e) =>
              setForm({ ...form, sessionMinutes: e.target.value })
            }
          />
          <Input
            label="Equipamentos"
            value={form.equipment}
            onChange={(e) => setForm({ ...form, equipment: e.target.value })}
            className="sm:col-span-2"
          />
          <Textarea
            label="Restrições / lesões"
            value={form.constraints}
            onChange={(e) => setForm({ ...form, constraints: e.target.value })}
            className="sm:col-span-2"
            placeholder="Ex.: dor no joelho esquerdo"
          />
          <Textarea
            label="Prompt livre"
            value={form.prompt}
            onChange={(e) => setForm({ ...form, prompt: e.target.value })}
            className="sm:col-span-2"
            placeholder="Detalhes extras para a IA…"
          />
          <div className="sm:col-span-2">
            <Button
              type="submit"
              variant="ai"
              size="lg"
              loading={loading}
              disabled={checking || (!latest && !allowWithout)}
            >
              <Sparkles className="h-4 w-4" />
              {loading ? "Gerando treino…" : "Gerar rascunho"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
