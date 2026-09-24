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
import type { Student } from "@/lib/mocks";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GerarIaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    goal: "Hipertrofia",
    daysPerWeek: "3",
    sessionMinutes: "60",
    level: "intermediate",
    constraints: "",
    equipment: "Academia completa",
    prompt: "",
  });

  useEffect(() => {
    api.listStudents().then((r) => setStudents(r.items));
  }, []);

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.generateWorkoutAi({
        studentId: form.studentId || undefined,
        goal: form.goal,
        daysPerWeek: Number(form.daysPerWeek),
        sessionMinutes: Number(form.sessionMinutes),
        level: form.level,
        constraints: form.constraints || undefined,
        equipment: form.equipment || undefined,
        prompt: form.prompt || undefined,
      });
      // Persist draft in sessionStorage for review screen (mock)
      sessionStorage.setItem(
        "ai-draft",
        JSON.stringify({
          draftId: res.draftId,
          workout: res.workout,
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
      />
      <Card className="max-w-2xl">
        <div className="mb-4 rounded-[var(--radius-md)] bg-ai/60 px-3 py-2 text-sm text-ai-text">
          Revisão obrigatória — o treino nunca é publicado automaticamente.
        </div>
        <form onSubmit={onGenerate} className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Aluno (opcional)"
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            className="sm:col-span-2"
          >
            <option value="">Perfil genérico</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <Input
            label="Objetivo"
            value={form.goal}
            onChange={(e) => setForm({ ...form, goal: e.target.value })}
            required
          />
          <Select
            label="Nível"
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
          >
            <option value="beginner">Iniciante</option>
            <option value="intermediate">Intermediário</option>
            <option value="advanced">Avançado</option>
          </Select>
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
            <Button type="submit" variant="ai" size="lg" loading={loading}>
              <Sparkles className="h-4 w-4" />
              {loading ? "Gerando treino…" : "Gerar rascunho"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
